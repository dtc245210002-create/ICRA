# Original User Request

## 2026-09-29T01:04:32Z

Xây dựng và hoàn thiện toàn diện ứng dụng web ICRA (Intelligent Course Registration Assistant) cho Trường Đại học Công nghệ Thông tin & Truyền thông (ICTU) theo kiến trúc React + TypeScript, Tailwind CSS, Lucide Icons chuẩn sản phẩm SaaS quản lý giáo dục đại học thương mại, tích hợp đầy đủ công cụ lọc đa chiều, thời khóa biểu ma trận tuần, phát hiện và xử lý xung đột giờ học, trợ lý AI gợi ý và quy trình rà soát xác nhận đăng ký.

Working directory: c:\Users\admin\OneDrive\Desktop\dự án_UIUX_ICRA
Integrity mode: development

## Requirements

### R1. Enterprise Header & Student Identity (Thanh điều hướng & Định danh)
Xây dựng thành phần Header hiển thị logo ICRA, tên trường ICTU, học kỳ hiện tại (Học kỳ 1, 2026 - 2027), huy hiệu cổng đăng ký đang mở, đồng hồ đếm ngược hạn nộp (74:15:20), thông tin sinh viên An Bá Thành (DTC245210002 • CNTT K24) và chuông thông báo hệ thống.

### R2. Course Explorer with Faceted Filtering (Khu vực Khám phá & Bộ lọc Đa chiều — 28% Width)
Xây dựng thành phần CourseExplorer và CourseCard:
- Tìm kiếm tức thì theo mã môn, tên môn hoặc giảng viên.
- Bộ lọc theo Khoa/Bộ môn (CNTT, Toán - Tin, Ngoại ngữ).
- Bộ lọc theo Ca học (Sáng: Tiết 1-5, Chiều: Tiết 6-11).
- Bộ lọc theo Ngày học (Thứ 2 đến Chủ Nhật) và thanh trượt số tín chỉ tối đa.
- Checkbox thông minh: Chỉ hiển thị lớp không trùng lịch.
- Danh sách thẻ học phần trực quan với 4 trạng thái rõ ràng: *Available*, *Selected*, *Conflict*, *Ineligible*.
- Thao tác di chuột (hover) kích hoạt khối mờ xem trước trên thời khóa biểu (*Ghost Block Preview*).

### R3. Weekly Timetable Matrix with Conflict Engine (Thời khóa biểu Ma trận Tuần & Động cơ Xử lý Xung đột — 47% Width)
Xây dựng thành phần WeeklyTimetable, TimetableCourseCard và ConflictAlert:
- Ma trận lịch tuần 8 cột (Thứ Hai đến Chủ Nhật x 4 Khung ca: Tiết 1-3, Tiết 4-5, Tiết 7-9, Tiết 10-11).
- Thuật toán kiểm tra xung đột dựa trên ngày học và khoảng tiết:
  Conflict = (day_A == day_B) && (start_A <= end_B && end_A >= start_B)
- Khi xảy ra trùng lịch, kích hoạt banner cảnh báo ConflictAlert, nhấp nháy đỏ báo động và rung thẻ môn học.
- Cung cấp nút tự động đổi sang lớp không trùng giờ chỉ trong 1 cú click.
- Hỗ trợ chuyển tuần và chuyển đổi giữa các phương án thời khóa biểu (*Phương án 1 / Phương án 2*).

### R4. AI Course Recommendation & Registration Summary (Trợ lý AI & Tổng quan Đăng ký — 25% Width)
Xây dựng thành phần AIRecommendation và RegistrationSummary:
- Thước đo tải học tập (Workload Meter) tự động phân tầng 3 mức: Thiếu tải (<12 TC - Vàng) / Cân đối (12-18 TC - Xanh lá) / Căng thẳng (>18 TC - Đỏ).
- Khối AI đề xuất môn học (màu tím Violet #8B5CF6), giải thích lý do đề xuất, kiểm tra độ tương thích TKB 100% và điều kiện tiên quyết.
- Danh sách học phần đã chọn trong giỏ kèm tính năng xóa tức thì (✕).
- Tự động tính học phí theo công thức: Tổng tín chỉ x 450.000 VNĐ.
- Ràng buộc nút chính Rà Soát & Xác Nhận Đăng Ký: Tự động khóa nếu < 12 TC hoặc đang có xung đột lịch.

### R5. Interactive Modals, Toast Feedback & Standalone Deployability
Xây dựng ConfirmationModal, modal chi tiết môn học, hệ thống Toast notifications:
- Modal rà soát đối soát 0 lỗi trùng và 100% đạt tiên quyết trước khi ghi danh.
- Hiệu ứng pháo hoa Confetti và cấp biên lai điện tử #ICRA-2026-9812-ICTU kèm xuất file Google Calendar (.ics).
- Đóng gói ứng dụng chạy được cả ở chế độ modular source trong src/ và chạy độc lập qua index.html trên máy chủ cục bộ hoặc hosting tĩnh.

## Acceptance Criteria

### UX & Functional Verification
- [ ] Tìm kiếm học phần phản hồi tức thì dưới 100ms khi gõ từ khóa.
- [ ] Bộ lọc khoa, ca học, ngày học và thanh trượt tín chỉ lọc chính xác danh sách môn học.
- [ ] Bắt lỗi trùng lịch học 100% chính xác với hiệu ứng cảnh báo thị giác và nút 1-click tự động đổi lớp.
- [ ] Rê chuột vào học phần hiển thị khối mờ (Ghost Block) chính xác trên ô lịch tương ứng.
- [ ] Thước đo tải học tập và học phí dự kiến cập nhật tự động ngay khi thêm hoặc bỏ môn.
- [ ] Không cho phép xác nhận đăng ký khi chưa đủ 12 tín chỉ hoặc đang tồn tại xung đột giờ học.
- [ ] Toàn bộ hệ thống hoạt động trơn tru trên trình duyệt với độ tương phản đạt chuẩn WCAG 2.1 AA.