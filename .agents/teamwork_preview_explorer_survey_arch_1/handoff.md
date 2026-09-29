# HANDOFF REPORT — System Architecture & 4-Tier E2E Test Survey
**Agent**: `teamwork_preview_explorer` (`teamwork_preview_explorer_survey_arch_1`)  
**Parent Agent**: `parent` (`92c8851c-967e-412d-a242-e0a02aa19063`)  
**Timestamp**: 2026-09-29T08:15:00+07:00  
**Handoff Type**: Hard (Task Complete)

---

## 1. Observation (Những gì quan sát được trực tiếp)

1. **Khảo sát cấu trúc tệp mã nguồn**:
   - `src/types/index.ts` định nghĩa `interface Course` có các trường `startPeriod: number`, `endPeriod: number`, `periodText: string`, `timeText: string` (dòng 4-22), nhưng **hoàn toàn không có trường `scheduleText`** hay `periodSlot`.
   - `src/data/mockCourses.ts` khai báo 8 môn học mẫu (dòng 14-153) với `startPeriod`, `endPeriod`, `periodText`, `timeText`, không hề có thuộc tính `scheduleText`.
   - Trong `src/components/CourseCard.tsx` (dòng 58):
     ```tsx
     <p className="text-[11px] font-semibold text-slate-700 mt-0.5">
       {course.scheduleText} ({course.timeText})
     </p>
     ```
     `course.scheduleText` là `undefined` vì kiểu `Course` và dữ liệu `mockCourses.ts` không cung cấp trường này.
   - Tương tự trong `src/components/ConflictAlert.tsx` (dòng 24):
     ```tsx
     Lớp <strong>{conflict.incomingCourse.code}</strong> bị trùng ca Thứ {conflict.incomingCourse.day} ({conflict.incomingCourse.scheduleText}) với môn <strong>{conflict.existingCourse.code}</strong> đã có trên lịch.
     ```
     `conflict.incomingCourse.scheduleText` cũng sẽ hiển thị rỗng hoặc `undefined`.

2. **Khảo sát thuật toán phát hiện xung đột hiện tại**:
   - Trong `src/components/CourseExplorer.tsx` (dòng 42 và dòng 153):
     ```tsx
     const isConflict = courses.some(x => selectedIds.includes(x.id) && x.id !== c.id && x.day === c.day && x.periodText === c.periodText);
     ```
     So sánh bằng chuỗi `periodText === periodText`.
   - Trong `index.html` (dòng 422, 639, 934):
     ```javascript
     const clash = courses.find(x => selectedIds.includes(x.id) && x.day === course.day && x.periodSlot === course.periodSlot);
     ```
     So sánh theo mã định danh rời rạc `periodSlot === periodSlot`.
   - Cả hai cách trên đều mâu thuẫn trực tiếp với yêu cầu cốt lõi tại `ORIGINAL_REQUEST.md` (R3, dòng 28-29):
     ```
     Thuật toán kiểm tra xung đột dựa trên ngày học và khoảng tiết:
     Conflict = (day_A == day_B) && (start_A <= end_B && end_A >= start_B)
     ```

3. **Khảo sát trạng thái bản chạy độc lập (`index.html`) và bản `src/`**:
   - `index.html` (53,449 bytes) chạy qua CDN React 18, Babel Standalone, Tailwind CSS, Lucide, Canvas-confetti, được phục vụ bởi `serve.js` (Node HTTP server cổng 8080).
   - Trong `index.html` (dòng 1065): Nút xuất lịch Google Calendar chỉ gọi:
     ```javascript
     onClick={() => alert('Đã tải xuống file lịch học ThoiKhoaBieu_ICRA_ICTU.ics!')}
     ```
     Chưa tạo hay download tệp `.ics` thực tế.
   - Trong `src/`: Không tồn tại `src/App.tsx`, không có `src/main.tsx` hoặc `index.tsx`, không có `package.json` hoặc bundler config trong thư mục gốc.

4. **Khảo sát môi trường thực thi và kiểm thử**:
   - Lệnh `node -v` trả về `v24.19.0`. Lệnh `npm -v` trả về `11.17.0`.
   - Lệnh `npm ping` trả về `npm notice PONG 449ms`.
   - Lệnh PowerShell kiểm tra file thực thi trình duyệt phát hiện:
     `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`
     `C:\Program Files\Google\Chrome\Application\chrome.exe`

---

## 2. Logic Chain (Chuỗi suy luận logic từ quan sát đến kết luận)

1. Từ **Quan sát 1**: `CourseCard.tsx` và `ConflictAlert.tsx` phụ thuộc vào `course.scheduleText`, trong khi `types/index.ts` và `mockCourses.ts` chỉ có `periodText`. Do đó, khi biên dịch hoặc render component trong `src/`, chuỗi lịch học bị khuyết tật hiển thị `undefined (07:00 - 09:25)`.
   $\implies$ **Cần chuẩn hóa hợp đồng dữ liệu**: Bổ sung `scheduleText` và `periodSlot` vào `Course` interface và cập nhật `mockCourses.ts`.

2. Từ **Quan sát 2**: So sánh chuỗi `periodText` hoặc mã slot `periodSlot` giả định rằng mọi học phần đều nằm gọn trong các khung cố định (1-3, 4-5, 7-9, 10-11). Nếu có học phần kéo dài qua 2 khung (ví dụ: `SE301` tiết 7-10), hoặc ca học lệch (tiết 2-4, 3-5), thuật toán rời rạc sẽ trả về `false` (không xung đột), dẫn đến sinh viên bị trùng lịch thực tế trên lớp học.
   $\implies$ **Toán học giao khoảng thời gian**: Điều kiện $\max(S_A, S_B) \le \min(E_A, E_B) \iff (S_A \le E_B) \land (E_A \ge S_B)$ là duy nhất đảm bảo tính chính xác 100% trong mọi tình huống. Cần đưa hàm này thành tiện ích dùng chung (`src/utils/conflictEngine.ts`).

3. Từ **Quan sát 3**: Các tính năng R3 (chuyển đổi Phương án 1 / 2), R5 (tải file .ics thực thụ, modal chi tiết môn học) hiện đang bị thiếu hoặc chỉ mô phỏng bằng alert. Bản `src/` chưa có tệp gốc `App.tsx` ghép nối các component.
   $\implies$ **Yêu cầu hoàn thiện**: Cần tạo `src/App.tsx` ghép nối các component hiện có với state flow hoàn chỉnh, đồng thời đồng bộ toàn bộ logic này vào `index.html` để đảm bảo cả hai phiên bản hoạt động song song không sai lệch.

4. Từ **Quan sát 4**: Node 24 hỗ trợ chạy native ESM và test runner `node --test` cực nhanh mà không cần bất kỳ cài đặt phụ thuộc nào. Thêm vào đó, máy đã cài sẵn Edge và Chrome, cho phép kiểm thử E2E không đầu (Headless) thông qua script tự động kiểm chứng toàn bộ 4 Tier kiểm thử.

---

## 3. Caveats (Các giới hạn và giả định)

- Giả định rằng danh mục môn học mẫu (8 môn) là tập dữ liệu đại diện đầy đủ cho các khoa CNTT, Toán - Tin, Ngoại ngữ. Để kiểm thử Tier 4 triệt để, khuyến nghị bổ sung thêm dữ liệu phát sinh (khoảng 30-50 môn học sinh tự động) để đo hiệu năng tìm kiếm dưới 100ms.
- Ứng dụng hiện chạy client-side state hoàn toàn (chưa có backend API cơ sở dữ liệu), điều này hoàn toàn phù hợp với tính chất của bài tập lớn thiết kế giao diện UI/UX ICTU và cho phép ứng dụng chạy offline tĩnh không phụ thuộc server mạng.

---

## 4. Conclusion (Kết luận đánh giá & Đề xuất kiến trúc)

1. **Kiến trúc giao diện 3 cột đạt chuẩn**: Bố cục 28% (Khám phá) - 47% (TKB) - 25% (Tổng quan) đáp ứng xuất sắc các nguyên lý thao tác trực tiếp của Shneiderman (Direct Manipulation) từ bài giảng số 6.
2. **Cần đồng bộ gấp 3 hạng mục dữ liệu**:
   - Giao diện `Course`: Thêm `scheduleText`, `periodSlot`, `alternateCourseId`.
   - Động cơ xung đột: Chuyển toàn bộ sang công thức toán học $(A.day == B.day) \land (A.startPeriod \le B.endPeriod \land A.endPeriod \ge B.startPeriod)$.
   - Tạo `src/App.tsx` hoàn chỉnh ghép 9 component hiện có, tích hợp bộ chuyển Phương án 1 / Phương án 2 và xuất file `.ics`.
3. **Kế hoạch kiểm thử 4-Tier sẵn sàng thực thi**: Đã xây dựng đầy đủ 35 ca kiểm thử chi tiết từ Tier 1 (Feature) đến Tier 4 (Performance & WCAG 2.1 AA) trong tài liệu `arch_survey.md`.

---

## 5. Verification Method (Phương pháp kiểm chứng độc lập)

Để các Agent tiếp theo hoặc người dùng độc lập xác thực các phát hiện trong báo cáo này:

1. **Kiểm tra lỗi dữ liệu `scheduleText`**:
   - Mở tệp `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\src\components\CourseCard.tsx` tại dòng 58.
   - Đối chiếu với `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\src\types\index.ts` (dòng 4-22). Xác nhận không có trường `scheduleText`.
2. **Kiểm tra lỗi so sánh xung đột rời rạc**:
   - Mở `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\index.html` tại dòng 422 và 934: Quan sát điều kiện `x.periodSlot === course.periodSlot`.
   - Mở `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\src\components\CourseExplorer.tsx` tại dòng 42: Quan sát điều kiện `x.periodText === c.periodText`.
3. **Kiểm tra tính sẵn sàng của máy chủ và môi trường**:
   - Chạy lệnh `node serve.js` trong PowerShell.
   - Mở trình duyệt tại `http://127.0.0.1:8080`.
   - Quan sát trên giao diện: nút Google Calendar chỉ kích hoạt alert (dòng 1065 trong index.html), và không có nút chuyển Phương án 1 / Phương án 2 trên TKB.
4. **Tài liệu tham khảo chi tiết**:
   - Khảo sát toàn diện & Kế hoạch 4-Tier: `c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA\.agents\teamwork_preview_explorer_survey_arch_1\arch_survey.md`.
