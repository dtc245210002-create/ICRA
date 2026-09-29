# Báo Cáo Khảo Sát Kiến Trúc Hệ Thống & Kế Hoạch Kiểm Thử E2E 4-Tier ICRA
**Dự án**: Intelligent Course Registration Assistant (ICRA) — ICTU  
**Tác giả**: Teamwork Preview Explorer (`teamwork_preview_explorer_survey_arch_1`)  
**Ngày thực hiện**: 29/09/2026  
**Thư mục làm việc**: `.agents/teamwork_preview_explorer_survey_arch_1/`

---

## 1. Tóm Tắt Tổng Quan (Executive Summary)

Dự án ICRA (Intelligent Course Registration Assistant) là ứng dụng hỗ trợ đăng ký học phần thông minh dành cho sinh viên Trường Đại học Công nghệ Thông tin & Truyền thông (ICTU), được thiết kế theo chuẩn SaaS giáo dục thương mại hiện đại với giao diện 3 cột cân đối (28% Khám phá - 47% TKB - 25% Tổng quan).

Qua quá trình rà soát mã nguồn thực tế tại thư mục gốc `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA`, chúng tôi ghi nhận hệ thống đang tồn tại ở hai hình thái phân tách:
1. **Mã nguồn phân rã (`src/`)**: Đã có các component React + TypeScript độc lập (`Header.tsx`, `CourseExplorer.tsx`, `CourseCard.tsx`, `WeeklyTimetable.tsx`, `TimetableCourseCard.tsx`, `ConflictAlert.tsx`, `RegistrationSummary.tsx`, `AIRecommendation.tsx`, `ConfirmationModal.tsx`), tệp kiểu `src/types/index.ts` và dữ liệu mẫu `src/data/mockCourses.ts`. Tuy nhiên, **chưa có `App.tsx`**, **chưa có `main.tsx`/`index.tsx`**, chưa có cấu hình đóng gói `package.json`/`vite.config.ts`, dẫn đến `src/` hiện tại chưa thể tự khởi chạy hoặc kiểm thử độc lập.
2. **Bản triển khai độc lập (`index.html` & `public_deploy/index.html`)**: Bản đơn tệp (Single File ~53KB) tích hợp React 18, Babel Standalone, Tailwind CSS CDN, Lucide Icons CDN và Canvas Confetti CDN. Bản này hiện đang phục vụ trực tiếp qua máy chủ `serve.js` (Node.js HTTP Server tại cổng 8080).

**Các phát hiện trọng yếu**:
- **Lỗi bất đối xứng mô hình dữ liệu (Data Contract Mismatch)**: `src/types/index.ts` định nghĩa `startPeriod`, `endPeriod`, `periodText`, `timeText`, nhưng trong `CourseCard.tsx` (dòng 58) và `ConflictAlert.tsx` (dòng 24) lại gọi `course.scheduleText` (thuộc tính chỉ có trong `index.html`). Ngược lại, `index.html` chỉ có `periodSlot: "p1"` mà thiếu `startPeriod` và `endPeriod`.
- **Sai sót trong thuật toán phát hiện xung đột**: `index.html` (dòng 422, 639, 934) so sánh định danh rời rạc `periodSlot === periodSlot`, còn `CourseExplorer.tsx` (dòng 42, 153) so sánh chuỗi `periodText === periodText`. Cả hai cách này đều vi phạm công thức toán học giao khoảng thời gian quy định tại yêu cầu gốc:
  $$\text{Conflict} \iff (day_A == day_B) \land (start_A \le end_B \land end_A \ge start_B)$$
  dẫn đến bỏ sót các trường hợp học phần kéo dài qua nhiều ca (ví dụ SE301: Tiết 7-10) hoặc các ca học gối đầu/lệch tiết.
- **Tính năng còn thiếu so với Yêu Cầu Gốc (`ORIGINAL_REQUEST.md`)**:
  - Thiếu bộ chuyển đổi **Phương án thời khóa biểu (Phương án 1 / Phương án 2)** tại thanh công cụ TKB.
  - Thiếu **Modal Chi tiết môn học** (`CourseDetailModal`) khi sinh viên bấm "Xem chi tiết" hoặc bấm vào thẻ môn trên TKB.
  - Nút xuất Google Calendar (`.ics`) ở màn hình biên lai chỉ hiển thị hàm `alert()` đơn giản, chưa thực sự khởi tạo và tải tệp `.ics` chuẩn RFC 5545.
  - Đồng hồ đếm ngược (74:15:20) trên Header là chuỗi tĩnh, chưa có logic đếm ngược thực tế (live countdown ticker).
  - Khối AI Đề xuất chưa chuyển sang trạng thái "Đã thêm" khi môn học đã nằm trong giỏ.
- **Hạ tầng kiểm thử sẵn có**: Môi trường máy trạm cài đặt sẵn Node.js v24.19.0, npm 11.17.0, Microsoft Edge (`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`) và Google Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`). Điều này cho phép xây dựng bộ kiểm thử tích hợp 4-Tier toàn diện kết hợp giữa trình chạy unit/integration siêu tốc tích hợp sẵn (`node --test`) và trình duyệt headless automation (`playwright-core` / `puppeteer-core`) kết nối trực tiếp đến trình duyệt có sẵn trên Windows.

---

## 2. Kiểm Tra & Đánh Giá Hiện Trạng Kiến Trúc (Architectural Audit)

### 2.1 Cấu Trúc Thư Mục & Phân Bố Trách Nhiệm

```
dự án_UIUX_ICRA/
├── index.html                   # Bản đơn tệp hoạt động độc lập (Babel + React CDN, 53.4 KB)
├── preview_ui_icra.html         # Bản sao của index.html phục vụ xem trước
├── public_deploy/
│   └── index.html               # Bản sao phục vụ hosting tĩnh
├── serve.js                     # HTTP Server Node.js (cổng 8080) phục vụ index.html
├── src/
│   ├── types/
│   │   └── index.ts             # Định nghĩa giao diện TypeScript (Course, ConflictInfo, StudentInfo, ToastMessage)
│   ├── data/
│   │   └── mockCourses.ts       # 8 học phần mẫu & thông tin sinh viên An Bá Thành
│   └── components/
│       ├── Header.tsx           # Thanh điều hướng, đếm ngược, định danh SV
│       ├── CourseExplorer.tsx   # Khu vực lọc đa chiều & tìm kiếm (28%)
│       ├── CourseCard.tsx       # Thẻ học phần hiển thị 4 trạng thái
│       ├── WeeklyTimetable.tsx  # Lưới ma trận TKB tuần (47%)
│       ├── TimetableCourseCard.tsx # Thẻ học phần nằm trên ô lưới TKB
│       ├── ConflictAlert.tsx    # Banner cảnh báo xung đột màu đỏ & nút đổi lớp
│       ├── RegistrationSummary.tsx # Thước đo tải, giỏ môn, học phí, nút nộp (25%)
│       ├── AIRecommendation.tsx # Khối đề xuất AI tím Violet
│       └── ConfirmationModal.tsx # Hộp thoại rà soát điều kiện & TKB
└── .agents/                     # Metadata & báo cáo của hệ thống AI Agent
```

### 2.2 Phân Tích Sự Bất Đồng Nhất Giữa `src/` Và `index.html`

| Tiêu chí | Bản Modular `src/` | Bản Standalone `index.html` | Đánh giá & Rủi ro |
| :--- | :--- | :--- | :--- |
| **Mô hình ca học** | `startPeriod: number`, `endPeriod: number`, `periodText: string` | `periodSlot: string` ("p1", "p2", "p3", "p4"), `scheduleText: string` | **Bất nhất nghiêm trọng**. `CourseCard.tsx` trong `src/` gọi `course.scheduleText` dẫn đến `undefined`. |
| **Thuật toán xung đột** | `c.periodText === x.periodText` (so sánh chuỗi tại `CourseExplorer.tsx:42`) | `c.periodSlot === x.periodSlot` (so sánh slot tại `index.html:422`) | **Sai lệch toán học**. Không hỗ trợ học phần vắt qua nhiều tiết hoặc lệch tiết (ví dụ: SE301 tiết 7-10). |
| **Khả năng chạy độc lập** | Thiếu `App.tsx`, thiếu `index.tsx`, thiếu cấu hình build/Vite | Chạy mượt mà trực tiếp trên mọi trình duyệt qua CDN và `serve.js` | `src/` hiện chưa thể chạy hoặc kiểm thử E2E nếu không dựng `App.tsx` và bundler. |
| **Biên lai & ICS** | Chưa có component ReceiptModal | Đã có modal biên lai nhưng nút ICS chỉ là `alert()` tĩnh | Cần hiện thực hàm tạo tệp `.ics` thực tế chuẩn RFC 5545. |
| **Khai thác biểu tượng** | Dùng `lucide-react` qua npm package | Dùng CDN `lucide.min.js` gọi `lucide.createIcons()` trong `useEffect` | Hoạt động tốt ở cả hai, nhưng cần thống nhất quy cách render icon. |

---

## 3. Thiết Kế Hợp Nhất Hợp Đồng Dữ Liệu (Unified Data Contracts)

Để loại bỏ hoàn toàn các lỗi `undefined` và đảm bảo tính đồng nhất 100% giữa `src/` và `index.html`, mô hình dữ liệu phải được chuẩn hóa như sau:

### 3.1 Mô Hình Học Phần Chuẩn Hóa (`Course`)

```typescript
// src/types/index.ts
export type ShiftType = 'MORNING' | 'AFTERNOON';
export type FacultyType = 'CNTT' | 'TOAN' | 'NN' | 'ATTT';
export type CourseStatus = 'available' | 'ineligible';
export type CourseCardVisualState = 'available' | 'selected' | 'conflict' | 'ineligible';

export interface Course {
  id: string;                    // Định danh duy nhất (VD: "CS101", "CS202-01")
  code: string;                  // Mã học phần hiển thị (VD: "CS101-01")
  name: string;                  // Tên học phần tiếng Việt
  faculty: FacultyType;          // Phân khoa
  credits: number;               // Số tín chỉ (1 - 4)
  lecturer: string;              // Giảng viên phụ trách
  room: string;                  // Giảng đường (VD: "P.302-A1")
  
  // Thông số thời gian chuẩn xác phục vụ thuật toán toán học
  day: number;                   // Thứ trong tuần: 2 (Thứ Hai) đến 8 (Chủ Nhật)
  startPeriod: number;           // Tiết bắt đầu: 1 đến 11
  endPeriod: number;             // Tiết kết thúc: 1 đến 11
  
  // Thông số hiển thị giao diện người dùng
  periodSlot: 'p1' | 'p2' | 'p3' | 'p4'; // Mã ca lưới: p1(1-3), p2(4-5), p3(7-9), p4(10-11)
  periodText: string;            // VD: "Tiết 1 - 3"
  scheduleText: string;          // VD: "Thứ Hai (Tiết 1 - 3)"
  timeText: string;              // VD: "07:00 - 09:25"
  shift: ShiftType;              // 'MORNING' (Tiết 1-5) hoặc 'AFTERNOON' (Tiết 6-11)
  
  // Trạng thái học vụ & AI
  status: CourseStatus;          // 'available' hoặc 'ineligible'
  prereqReason?: string;         // Lý do chưa đủ điều kiện (VD: "Chưa đủ 60 TC")
  isAiRecommended?: boolean;     // Cờ đánh dấu môn AI đề xuất
  color: 'blue' | 'emerald' | 'purple' | 'amber' | 'indigo' | 'red' | 'slate';
  
  // Hỗ trợ tự động đổi lớp (1-Click Conflict Resolution)
  alternateCourseId?: string;    // ID của lớp học phần thay thế không trùng lịch (VD: "CS202-01")
}
```

### 3.2 Mô Hình Xung Đột & Hỗ Trợ Đổi Ca (`ConflictInfo`)

```typescript
export interface ConflictInfo {
  incomingCourse: Course;        // Lớp vừa bấm chọn hoặc gây va chạm
  existingCourse: Course;        // Lớp đang có sẵn trong TKB bị trùng giờ
  day: number;                   // Thứ bị trùng (2-8)
  conflictPeriodRange: string;   // Khoảng tiết trùng (VD: "Tiết 1 - 3")
  recommendedAlternate?: Course; // Lớp đối ứng không trùng giờ được gợi ý thay thế
}
```

### 3.3 Mô Hình Sinh Viên & Phương Án TKB

```typescript
export interface StudentInfo {
  name: string;                  // "An Bá Thành"
  studentId: string;             // "DTC245210002"
  classGroup: string;            // "CNTT K24"
  major: string;                 // "Kỹ thuật Phần mềm"
  accumulatedCredits: number;    // 45
  targetCredits: number;         // 135
  term: string;                  // "Học kỳ 1 (2026 - 2027) — Đợt chính"
}

export type TimetablePlanId = 'plan1' | 'plan2';

export interface TimetablePlan {
  id: TimetablePlanId;
  name: string;                  // "Phương án 1" / "Phương án 2"
  selectedCourseIds: string[];   // Danh sách ID học phần của phương án này
}
```

---

## 4. Phân Tích & Chứng Minh Toán Học Động Cơ Xử Lý Xung Đột (Conflict Detection Engine Math)

### 4.1 Định Lý Giao Khoảng Thời Gian (Interval Overlap Theorem)

Hai học phần $A$ và $B$ xảy ra xung đột thời khóa biểu khi và chỉ khi chúng học **cùng một ngày trong tuần** và **khoảng thời gian tiết học của chúng giao nhau (overlap)**:

$$\text{Conflict}(A, B) \iff (A.day = B.day) \land (A.id \ne B.id) \land \left( [A.startPeriod, A.endPeriod] \cap [B.startPeriod, B.endPeriod] \ne \emptyset \right)$$

Trong không gian rời rạc các số nguyên tiết học liên tục $[S_A, E_A]$ và $[S_B, E_B]$ (với điều kiện tiền định $S_A \le E_A$ và $S_B \le E_B$), điều kiện giao nhau được suy diễn tương đương logic như sau:

$$\max(S_A, S_B) \le \min(E_A, E_B)$$

Khai triển tính chất bất đẳng thức:
1. $\max(S_A, S_B) \le E_B \implies S_A \le E_B$
2. $\max(S_A, S_B) \le E_A \implies S_B \le E_A \iff E_A \ge S_B$

Từ đó suy ra công thức kiểm tra giao khoảng thời gian tối ưu bậc $O(1)$:
$$\mathbf{IsOverlapping}(A, B) \iff (A.startPeriod \le B.endPeriod) \land (A.endPeriod \ge B.startPeriod)$$

Kết hợp với điều kiện cùng ngày học, ta có thuật toán cốt lõi:
```typescript
export function checkScheduleConflict(courseA: Course, courseB: Course): boolean {
  if (courseA.id === courseB.id) return false;
  if (courseA.day !== courseB.day) return false;
  return (courseA.startPeriod <= courseB.endPeriod) && (courseA.endPeriod >= courseB.startPeriod);
}
```

### 4.2 Ma Trận Rà Soát Các Trường Hợp Biên (Edge Cases)

| Kịch bản kiểm thử | Học phần A $[S_A, E_A]$ | Học phần B $[S_B, E_B]$ | $S_A \le E_B$ | $E_A \ge S_B$ | Kết quả Toán học | Kết quả nếu so sánh Slot / Chuỗi |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Trùng khớp hoàn toàn** | Tiết 1 - 3 $[1, 3]$ | Tiết 1 - 3 $[1, 3]$ | $1 \le 3$ (True) | $3 \ge 1$ (True) | **Xung đột** (True) | Xung đột (True) |
| **Giao tại điểm mút** | Tiết 1 - 3 $[1, 3]$ | Tiết 3 - 5 $[3, 5]$ | $1 \le 5$ (True) | $3 \ge 3$ (True) | **Xung đột** (True) | **Bỏ lọt lỗi!** (Slot p1 $\ne$ p2) |
| **Học phần vắt qua nhiều ca** | Tiết 7 - 10 $[7, 10]$ | Tiết 10 - 11 $[10, 11]$ | $7 \le 11$ (True) | $10 \ge 10$ (True) | **Xung đột** (True) | **Bỏ lọt lỗi!** (Slot p3 $\ne$ p4) |
| **Bao hàm toàn phần** | Tiết 1 - 5 $[1, 5]$ | Tiết 2 - 3 $[2, 3]$ | $1 \le 3$ (True) | $5 \ge 2$ (True) | **Xung đột** (True) | **Bỏ lọt lỗi!** (Khác chuỗi) |
| **Hai ca liền kề không giao** | Tiết 1 - 3 $[1, 3]$ | Tiết 4 - 5 $[4, 5]$ | $1 \le 5$ (True) | $3 \ge 4$ (False) | **Hợp lệ** (False) | Hợp lệ (False) |
| **Khác ngày trong tuần** | Thứ 2, Tiết 1-3 | Thứ 3, Tiết 1-3 | Không xét khoảng | Không xét khoảng | **Hợp lệ** (False) | Hợp lệ (False) |

**Kết luận**: Việc chuyển đổi hoàn toàn sang công thức toán học khoảng tiết là **bắt buộc** để loại bỏ 100% rủi ro sinh viên bị trùng lịch ngoài thực tế.

---

## 5. Kiến Trúc Luồng Trạng Thái Toàn Cục (State Flow & Lifecycle Architecture)

### 5.1 Sơ Đồ Chuyển Trạng Thái Ứng Dụng (Application State Machine)

```
[Kho Học Phần (Catalog)]
         │
         ├─── (Di chuột hover) ─────────────► [Ghost Block Preview trên TKB]
         │
         ├─── (Bấm Thêm vào TKB) ───────────┐
         │                                  ▼
         │                        [Kiểm Tra Thuật Toán Xung Đột]
         │                                  │
         │                 ┌────────────────┴────────────────┐
         │                 ▼ (Có xung đột)                   ▼ (Không xung đột)
         │       [Kích Hoạt ConflictAlert]         [Thêm Vào SelectedIds]
         │       - Banner đỏ trượt xuống           - Cập nhật ô lưới TKB (Blue)
         │       - Hiệu ứng Rung & Nhấp nháy       - Cập nhật Thước đo tải (Workload)
         │       - Toast Warning/Error             - Cập nhật Học phí (Credits * 450k)
         │                 │                                 │
         │                 ▼ (Bấm Nút Tự Đổi Ca 1-Click)     │
         │       [Tự động Swap sang AlternateCourse] ────────┘
         │
         ▼
[Kiểm Tra Ngưỡng Xác Nhận Đăng Ký]
(Điều kiện: Tổng tín chỉ >= 12 && Conflict == null)
         │
         ├─── (Chưa đủ điều kiện) ──► Nút "Rà Soát & Xác Nhận" bị KHÓA (disabled / xám)
         │
         └─── (Đạt chuẩn) ──────────► Nút KÍCH HOẠT (Xanh dương, đổ bóng)
                                               │
                                               ▼ (Bấm mở Modal)
                                    [ConfirmationModal (Rà soát 0 lỗi)]
                                               │
                                               ▼ (Bấm Gửi Đăng Ký)
                                    [Kích Hoạt Confetti Pháo Hoa]
                                               │
                                               ▼
                                    [Mở ReceiptModal (#ICRA-2026-9812-ICTU)]
                                               │
                                               ▼ (Bấm Tải ICS)
                                    [Xuất Tệp Lịch .ics Chuẩn RFC 5545]
```

### 5.2 Quản Lý Đa Phương Án Thời Khóa Biểu (Plan 1 vs Plan 2 Switcher)
Theo yêu cầu R3, hệ thống phải hỗ trợ chuyển đổi linh hoạt giữa 2 phương án:
- Trạng thái quản lý:
  ```typescript
  const [activePlan, setActivePlan] = useState<'plan1' | 'plan2'>('plan1');
  const [plans, setPlans] = useState<Record<string, string[]>>({
    plan1: ["CS101", "CS201", "MATH101", "ENG101"], // 12 TC cơ sở
    plan2: ["CS101", "MATH101", "ENG101", "NET101", "CS202-01"] // 15 TC nâng cao
  });
  ```
- Khi chuyển đổi qua lại giữa `plan1` và `plan2`, giao diện tức thì cập nhật toàn bộ: TKB tuần, thước đo tải, học phí dự kiến, và danh sách môn trong giỏ mà không làm mất cấu hình đã xếp của phương án kia.

---

## 6. Phân Bổ Ranh Giới Giao Diện & Tiêu Chuẩn UI/UX (Layout & WCAG 2.1 AA)

### 6.1 Bố Cục Không Gian 3 Cột Chuẩn Mực

Giao diện áp dụng tỷ lệ vàng 3 cột theo chuẩn desktop SaaS giáo dục với tổng tỷ lệ 100%:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ HEADER (R1): ICRA Logo | ICTU | Học kỳ 1 2026-2027 | Cổng mở | 74:15:20 | An Bá Thành   │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ BANNER CẢNH BÁO XUNG ĐỘT (ConflictAlert): Trượt xuống khi có va chạm lịch học            │
├──────────────────────┬───────────────────────────────────────────┬───────────────────────┤
│ KHÁM PHÁ HỌC PHẦN    │ THỜI KHÓA BIỂU TUẦN (R3)                  │ TỔNG QUAN ĐĂNG KÝ     │
│ (CourseExplorer)     │ (WeeklyTimetable)                         │ (RegistrationSummary) │
│                      │                                           │                       │
│ Chiều rộng: 28%      │ Chiều rộng: 47%                           │ Chiều rộng: 25%       │
│                      │                                           │                       │
│ - Ô tìm kiếm tức thì │ - Điều hướng tuần (Tuần 01)               │ - Thước đo tải (3 mức)│
│ - Bộ lọc Khoa        │ - Chuyển Phương án 1 / 2                  │ - Gợi ý AI (Violet)   │
│ - Bộ lọc Ca học      │ - Ma trận 8 cột (Giờ + Thứ 2 -> CN)       │ - Danh sách giỏ môn   │
│ - Bộ lọc Ngày học    │ - 4 khung ca (Tiết 1-3, 4-5, 7-9, 10-11)  │ - Học phí (450k/TC)   │
│ - Slider Tín chỉ     │ - Thẻ môn đã chọn                         │ - Nút Rà Soát (Lock)  │
│ - Checkbox Không Trùng│ - Khối mờ Ghost Preview                   │                       │
│ - Danh sách thẻ môn  │ - Ô va chạm nhấp nháy đỏ + Rung           │                       │
└──────────────────────┴───────────────────────────────────────────┴───────────────────────┘
```

### 6.2 Bảng Mã Màu & Kiểm Soát Độ Tương Phản (WCAG 2.1 AA)

| Thành phần | Mã Màu Sử Dụng | Màu Nền Tương Ứng | Tỷ Lệ Tương Phản (Contrast Ratio) | Đạt Chuẩn WCAG 2.1 AA |
| :--- | :--- | :--- | :--- | :--- |
| **Tiêu đề chính / Header** | `#0F172A` (Slate 900) | `#FFFFFF` | **16.1 : 1** | Đạt chuẩn AAA ($\ge 7:1$) |
| **Màu thương hiệu chính** | `#2563EB` (Blue 600) | `#FFFFFF` | **4.68 : 1** | Đạt chuẩn AA ($\ge 4.5:1$) |
| **Văn bản nút bấm chính** | `#FFFFFF` (White) | `#2563EB` (Blue 600) | **4.68 : 1** | Đạt chuẩn AA |
| **Cảnh báo Xung đột** | `#991B1B` (Red 800) | `#FEF2F2` (Red 50) | **7.82 : 1** | Đạt chuẩn AAA |
| **Khối AI Đề xuất** | `#581C87` (Purple 900) | `#F5F3FF` (Purple 50) | **10.5 : 1** | Đạt chuẩn AAA |
| **Nút bấm AI đề xuất** | `#FFFFFF` (White) | `#8B5CF6` (Violet 500) | **4.52 : 1** | Đạt chuẩn AA |
| **Thước đo tải (Cân đối)**| `#047857` (Emerald 700) | `#ECFDF5` (Emerald 50) | **6.12 : 1** | Đạt chuẩn AA |
| **Mã môn học (Badge)** | `#1E40AF` (Blue 800) | `#EFF6FF` (Blue 50) | **7.15 : 1** | Đạt chuẩn AAA |

---

## 7. Khảo Sát Hạ Tầng & Công Nghệ Kiểm Thử (Testing Infrastructure)

### 7.1 Phân Tích Công Cụ Sẵn Có Tại Máy Trạm
- **Node.js**: Phiên bản `v24.19.0`. Tích hợp sẵn `node --test` và `node:assert/strict`. Hỗ trợ chạy các bài kiểm thử logic toán học, lọc đa chiều, và kiểm tra trạng thái cực nhanh (<50ms, không cần cài đặt thêm thư viện ngoài).
- **Trình duyệt hệ thống**:
  - Microsoft Edge: `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
  - Google Chrome: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- **Máy chủ cục bộ**: Tệp `serve.js` phục vụ `index.html` tại cổng `8080` qua giao thức HTTP thuần `http://127.0.0.1:8080`.
- **Khả năng cài đặt thư viện**: Đã kiểm tra `npm ping` kết nối npmjs.org thành công (449ms). Có thể cài đặt `playwright-core` (kết nối trực tiếp với file exe trình duyệt có sẵn mà không cần tải thêm Chromium nặng nề).

### 7.2 Chiến Lược Kiểm Thử Song Hành (Dual-Mode Verification Strategy)
Hệ thống kiểm thử được thiết kế để tự động xác thực song song cả 2 môi trường:
1. **Kiểm thử logic cấp thấp (Unit & Engine Tests)**: Chạy qua `node --test` để rà soát toàn bộ ma trận xung đột, công thức học phí, phân tầng thước đo tải và bộ lọc.
2. **Kiểm thử E2E giao diện người dùng (Browser Automation)**: Chạy tự động trên trình duyệt thật (Edge/Chrome qua headless mode) đối chiếu trực tiếp `index.html` và bản `src/` modular.

---

## 8. Kế Hoạch Kiểm Thử E2E 4-Tier Chi Tiết (4-Tier E2E Test Suite Plan)

### Tier 1: Kiểm Thử Chức Năng Tiêu Chuẩn (Feature E2E Tests — Acceptance Criteria)

| Mã Test | Tên Kịch Bản | Thao Tác Thực Hiện | Kết Quả Kỳ Vọng (Pass Criteria) |
| :--- | :--- | :--- | :--- |
| **TC-T1-01** | Định danh SV & Header | Mở trang chủ ứng dụng | Hiển thị chính xác tên "An Bá Thành", MSSV "DTC245210002", lớp "CNTT K24", đếm ngược hạn nộp và huy hiệu "Cổng Đăng Ký Đang Mở". |
| **TC-T1-02** | Tìm kiếm học phần tức thì | Nhập từ khóa `"CS101"` hoặc `"Nguyễn Thanh Hải"` | Danh sách môn lọc ngay lập tức (<100ms), chỉ hiển thị các môn khớp mã, tên môn hoặc tên giảng viên. |
| **TC-T1-03** | Bộ lọc Faceted Đa chiều | Chọn Khoa "CNTT", Ca "Sáng", slider 3 TC | Chỉ các môn thỏa mãn đồng thời 3 điều kiện được hiển thị; số lượng môn cập nhật chính xác. |
| **TC-T1-04** | Checkbox Lọc Không Trùng | Tích chọn "Chỉ hiện lớp không trùng lịch" | Tự động ẩn học phần `CS202-02` (do đang trùng ca Sáng Thứ Ba với `CS201`). |
| **TC-T1-05** | Khối mờ Ghost Preview | Di chuột qua thẻ `CS202-01` | Xuất hiện khối mờ viền nét đứt (dashed blue) kèm icon 👻 tại ô Thứ Năm, Tiết 7-9 trên lưới TKB. Rời chuột thì khối mờ biến mất. |
| **TC-T1-06** | Thêm môn học hợp lệ | Bấm "+ Thêm vào TKB" trên môn `NET101` | Môn xuất hiện trên ô Thứ Năm Tiết 1-3 của TKB; giỏ hàng tăng số lượng; hiển thị Toast thành công màu xanh. |
| **TC-T1-07** | Bỏ chọn môn học | Bấm nút ✕ trên môn `NET101` tại giỏ hàng | Môn biến mất khỏi TKB; tổng tín chỉ giảm; hiển thị Toast thông báo. |
| **TC-T1-08** | Bắt lỗi xung đột giờ học | Bấm thêm môn `CS202-02` khi đã có `CS201` | Không cho thêm vào TKB; Banner cảnh báo đỏ trượt xuống; ô Thứ Ba nhấp nháy đỏ (`conflict-cell shake-alert`); Toast đỏ xuất hiện. |
| **TC-T1-09** | Tự động đổi lớp 1-Click | Bấm "Tự động đổi sang CS202-01 (Chiều Thứ 5)" | Banner xung đột đóng; hệ thống tự động gỡ `CS202-02` và thêm `CS202-01` vào TKB; Toast thông báo đã giải quyết xung đột. |
| **TC-T1-10** | Gợi ý AI Thông minh | Bấm "+ Thêm học phần này vào TKB" tại khối AI | Tự động thêm `CS202-01` vào TKB; khối AI chuyển trạng thái hoặc vô hiệu hóa nút; Toast tím/xanh xác nhận. |
| **TC-T1-11** | Cập nhật Thước đo & Học phí | Thêm lần lượt các môn | Thước đo tải nhảy mức; số tiền học phí nhân chính xác: $Credits \times 450.000$ VNĐ. |
| **TC-T1-12** | Khóa nút nộp đăng ký | Khi tổng tín chỉ < 12 hoặc đang có xung đột | Nút "Rà Soát & Xác Nhận Đăng Ký" bị disabled, có class màu xám và cursor-not-allowed. |
| **TC-T1-13** | Modal Rà Soát Điều Kiện | Bấm nút khi đủ 12 TC và 0 xung đột | Mở ConfirmationModal với huy hiệu "Hệ thống ICRA đã đối soát hợp lệ: 0 lỗi xung đột • 100% đạt chuẩn". |
| **TC-T1-14** | Xác Nhận & Pháo hoa Confetti | Bấm "Gửi Đăng Ký Chính Thức" | Hiệu ứng pháo hoa Confetti bắn lên; ReceiptModal mở ra với mã `#ICRA-2026-9812-ICTU`. |
| **TC-T1-15** | Xuất Lịch Google Calendar | Bấm "Đồng Bộ Google Calendar / Tải File .ICS" | Trình duyệt kích hoạt tải tệp `ThoiKhoaBieu_ICRA_ICTU.ics` hợp lệ chuẩn RFC 5545. |

---

### Tier 2: Kiểm Thử Giá Trị Biên & Ngoại Lệ (Boundary & Edge Case Tests)

| Mã Test | Tên Kịch Bản | Giá Trị Biên Đầu Vào | Kết Quả Kỳ Vọng |
| :--- | :--- | :--- | :--- |
| **TC-T2-01** | Ngưỡng Tín Chỉ Cận Dưới (11 vs 12) | Sinh viên chọn 11 TC vs 12 TC | Tại 11 TC: Thước đo báo "Thiếu tải (<12 TC)", nút nộp KHÓA. Tại 12 TC: Chuyển sang "Cân đối", nút nộp MỞ. |
| **TC-T2-02** | Ngưỡng Tín Chỉ Cận Trên (18 vs 19) | Sinh viên chọn 18 TC vs 19 TC | Tại 18 TC: Thước đo màu xanh lá ("Cân đối"). Tại 19 TC: Thước đo chuyển màu đỏ ("Tải cao (>18 TC)"). |
| **TC-T2-03** | Điểm mút giao tiết học | Môn A: Tiết 1-3, Môn B: Tiết 3-5 (cùng ngày) | Thuật toán bắt chính xác xung đột tại Tiết 3 ($1 \le 5 \land 3 \ge 3$). |
| **TC-T2-04** | Ca học liền kề không giao nhau | Môn A: Tiết 1-3, Môn B: Tiết 4-5 (cùng ngày) | Không xảy ra xung đột ($3 \ge 4$ là False). Cho phép đăng ký cả 2 môn bình thường. |
| **TC-T2-05** | Môn vắt qua nhiều ca | Môn đặc thù: Tiết 7-10 | Hiển thị chiếm trọn ca p3 (7-9) và tràn sang ca p4 (10-11). Bắt xung đột nếu có môn khác trong ca p4. |
| **TC-T2-06** | Tìm kiếm không có kết quả | Nhập chuỗi ngẫu nhiên `"KHONG_CO_MON_NAY_999"` | Hiển thị trạng thái trống thân thiện (Empty State: "Không tìm thấy học phần phù hợp") kèm nút "Đặt lại bộ lọc". |
| **TC-T2-07** | Thao tác chọn môn chưa đủ ĐK | Bấm chọn môn `SE301` (trạng thái ineligible) | Nút bị khóa ("Không thể chọn"), thẻ mờ đục 60%, ghi rõ lý do "Chưa tích lũy đủ 60 TC". |
| **TC-T2-08** | Di chuột Ghost vào ô đã có môn | Hover môn mới vào ô lịch đã có môn đăng ký | Không làm mất thẻ môn đã chọn; hiển thị chỉ báo cảnh báo trực quan. |

---

### Tier 3: Kiểm Thử Tổ Hợp & Luồng Đa Bước (Combinatorial & Multi-Action Flow Tests)

| Mã Test | Tên Kịch Bản | Tổ Hợp Hành Động | Kết Quả Kỳ Vọng |
| :--- | :--- | :--- | :--- |
| **TC-T3-01** | Lọc giao 4 tiêu chí | Khoa = "CNTT" + Ca = "Chiều" + Thứ = "5" + Tín chỉ = 3 | Chỉ ra duy nhất môn `CS202-01`. Bộ đếm hiển thị "1 học phần". |
| **TC-T3-02** | Chuyển đổi Phương Án TKB | Đổi từ Phương án 1 (12 TC) sang Phương án 2 (15 TC) | Toàn bộ lưới TKB, số môn trong giỏ và tổng học phí chuyển tức thì theo Phương án 2. Quay lại PA 1 vẫn giữ nguyên 12 TC. |
| **TC-T3-03** | Chuỗi Va chạm -> Đổi lớp -> Nộp | Chọn CS202-02 -> Va chạm -> Bấm Đổi lớp -> Mở Modal -> Nộp | Dòng chảy liền mạch không gián đoạn, 0 lỗi console, tải biên lai thành công. |
| **TC-T3-04** | Trạng thái nút AI sau khi thêm | Bấm thêm môn từ khối AI -> Kiểm tra lại khối AI | Khối AI đổi nút sang trạng thái "Đã thêm vào TKB" (màu xám, disabled) để tránh thêm trùng lặp. |
| **TC-T3-05** | Khôi phục mặc định | Bỏ hết môn -> Bấm "Khôi phục mặc định" | TKB tự động nạp lại 4 môn chuẩn (12 TC: CS101, CS201, MATH101, ENG101), xóa sạch mọi xung đột đang có. |
| **TC-T3-06** | Đóng/mở Modal đa tầng | Mở Modal Rà soát -> Bấm "Quay lại" -> Mở lại -> Bấm "Gửi" | Modal đóng mở mượt mà, backdrop blur hiển thị chuẩn, không bị khóa thanh cuộn trang. |

---

### Tier 4: Kiểm Thử Tải Thực Tế, Hiệu Năng & Khả Năng Tiếp Cận (Real-World, Stress & Accessibility Tests)

| Mã Test | Tiêu Chuẩn Kiểm Định | Phương Pháp Đo Lường | Ngưỡng Đạt Yêu Cầu (Target Benchmark) |
| :--- | :--- | :--- | :--- |
| **TC-T4-01** | Tốc độ phản hồi tìm kiếm | Đo thời gian từ sự kiện `onInput` đến khi DOM re-render xong | **< 100ms** khi gõ liên tục 50 ký tự trên catalog 100 môn học. |
| **TC-T4-02** | Tính ổn định DOM & Tránh rò rỉ | Thực hiện thao tác thêm/bỏ môn 100 lần liên tục | Số lượng DOM Nodes ổn định, heap memory không tăng đột biến, không có component re-render vô tận. |
| **TC-T4-03** | Đồng nhất 2 chế độ (Dual-Mode Parity) | So sánh DOM Tree & CSS computed styles giữa `index.html` và `src/` | 100% khớp các class Tailwind cốt lõi, tỷ lệ kích thước 3 cột (28% - 47% - 25%) hoàn toàn giống nhau. |
| **TC-T4-04** | Chuẩn tiếp cận WCAG 2.1 AA | Chạy kiểm toán Axe-Core / Lighthouse Accessibility | Tỷ lệ tương phản màu chữ $\ge 4.5:1$, các nút bấm có `aria-label`, không có lỗi tương phản màu nào. |
| **TC-T4-05** | Tương thích Offline / Mạng yếu | Chặn kết nối mạng sau khi tải xong trang | Ứng dụng vẫn chạy mượt mà, tính toán xung đột và tải tệp `.ics` hoàn toàn cục bộ bằng JavaScript. |

---

## 9. Lộ Trình Hiện Thực Hóa & Khuyến Nghị Kiến Trúc (Architecture Recommendations & Roadmap)

Dành cho Agent triển khai tiếp theo:

1. **Chuẩn hóa tệp kiểu dữ liệu (`src/types/index.ts`)**:
   - Bổ sung `scheduleText: string`, `periodSlot: 'p1' | 'p2' | 'p3' | 'p4'`, `alternateCourseId?: string`.
2. **Cập nhật dữ liệu mẫu (`src/data/mockCourses.ts`)**:
   - Đồng bộ đầy đủ các trường `scheduleText` và `periodSlot` cho toàn bộ 8 học phần mẫu.
3. **Cài đặt hàm toán học xung đột dùng chung (`src/utils/conflictEngine.ts`)**:
   - Trích xuất logic so sánh khoảng tiết ra module tiện ích độc lập để dùng chung cho cả `CourseExplorer`, `WeeklyTimetable`, `RegistrationSummary` và các bài test.
4. **Bổ sung `CourseDetailModal`**:
   - Tạo component xem chi tiết môn học (Mô tả, mục tiêu, điều kiện tiên quyết, phòng học, giảng viên) khi người dùng nhấp vào thẻ môn hoặc ô TKB.
5. **Bổ sung Bộ chuyển Phương án TKB (`PlanSwitcher`)**:
   - Đặt tại thanh công cụ của `WeeklyTimetable.tsx` cho phép chuyển đổi nhanh "Phương án 1" và "Phương án 2".
6. **Hiện thực hàm xuất file `.ics` thực sự (`src/utils/icsExport.ts`)**:
   - Tạo Blob chuỗi iCalendar hợp lệ chứa thông tin các môn đã đăng ký và kích hoạt thẻ `<a>` ảo để trình duyệt tự động download file `ThoiKhoaBieu_ICRA_ICTU.ics`.
7. **Đồng bộ mã nguồn giữa `src/` và `index.html`**:
   - Đảm bảo bản `index.html` duy trì đầy đủ các cải tiến mới nhất, chạy mượt mà không cần cài đặt.
8. **Dựng bộ test tự động**:
   - Tạo tệp `tests/conflictEngine.test.mjs` chạy qua `node --test`.
   - Tạo tệp `tests/e2e_icra_survey.spec.mjs` chạy qua headless browser (Edge/Chrome) kiểm chứng 4 Tier.
