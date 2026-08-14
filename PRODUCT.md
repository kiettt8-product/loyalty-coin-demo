# Product

## Register

product

## Users

Business, Operations, FA và Product Ops sử dụng CRM nội bộ để config, review và vận hành campaign phát Loyalty Coin. User làm việc trên desktop, cần scan nhanh form và table có density cao.

## Product Purpose

Demo đúng flow Loyalty Coin Campaign trong buổi grooming: tạo campaign, config budget/package, submit approval, generate Present ID và gắn Present ID vào Trigger Based Campaign.

## Brand Personality

Quen thuộc, chính xác, tiết chế. UI phải nhìn như một phần có sẵn của Zalopay CRM, không phải một product mới.

## Anti-references

- Không tự tạo design system mới.
- Không dùng dashboard card lớn, page title lớn, summary card hoặc diagram không có trong Figma.
- Không thay đổi app shell, spacing, typography và component vocabulary của Zalopay CRM.
- Không dùng styling generic do AI tự suy diễn.

## Design Principles

- Figma là source of truth cho visual và layout.
- Reuse đúng shell/component pattern từ Direct Discount và Promotion Code.
- Density và hierarchy phục vụ thao tác nghiệp vụ, không phục vụ trang trí.
- Interaction demo phải bám business rule đã chốt trong PRD.
- Cùng một field/button/status phải có cùng visual vocabulary trên mọi screen.

## Budget Display Rules

- `Consumed Budget` và `Remaining Budget` được ẩn tại Create và các status chưa bắt đầu phát xu: `Draft`, `FA Review`, `Rejected`, `Approved`, `Auto Approved`.
- Hai field chỉ hiển thị read-only tại `In Use`, `Distributing`, `Ended` và format theo `vi-VN`.
- `Control budget by campaign`: Consumed Budget là tổng consumed của campaign; `Remaining Budget = MAX(Allocated Budget - Campaign Consumed Budget, 0)`.
- `Control budget by package`: Consumed Budget theo từng package; `Remaining Budget = MAX(Package Budget - Package Consumed Budget, 0)`.
- Khi Business edit Package Budget, UI preview Remaining Budget ngay nhưng Save phải revalidate bằng latest consumed snapshot.
- Không hiển thị Estimated Budget hoặc Budget dư.

## Coin History Content

- Mỗi distribution package có một field mandatory `Coin History Content`, tối đa 100 ký tự.
- Đây là nội dung End-user nhìn thấy tại màn `Tích xu` trên Zalopay app; không dùng lại campaign description nội bộ.
- UI preview realtime nội dung và `Coin Per User` để Business kiểm tra trước khi Save.
- Field editable tại Create, Draft, Rejected; read-only từ `FA Review`, `Approved`, `Auto Approved`, `In Use`, `Distributing`, `Ended`.
- Khi Submit mà bỏ trống, chặn lưu và hiển thị inline error `Coin History Content is required`.

## Accessibility & Inclusion

Keyboard usable, focus visible, label không thay bằng placeholder, semantic status không chỉ dựa vào màu và hỗ trợ reduced motion.
