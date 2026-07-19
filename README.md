# Loyalty Coin Campaign Demo

Prototype HTML/CSS/JS dùng cho buổi grooming. UI bám theo Figma `[Zalopay] CRM Design`, page `[Feature] Distribute Coin`.

## Chạy demo

Tại folder này, chạy:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Sau đó mở:

```text
http://127.0.0.1:4173
```

## Flow có thể demo

1. Campaign List: Search, Reset, Collapse, View và Edit.
2. Create Campaign: Shared/Non-shared budget, Control by Campaign/Package.
3. Distribution Package: By Quantity, By Budget, Add/Remove, max 10 package và tự tính budget.
4. Budget Alert: nhập username/email và threshold bằng phím Enter.
5. Submit: Auto Approved hoặc FA Review theo Coin Per User.
6. Generate Present ID: mô phỏng all package thành công sau Auto Approved.
7. Trigger Based Campaign: chọn Campaign trước, sau đó Present ID mới được enable và load đúng package.

`qa.mjs` là smoke test dùng để kiểm tra interaction chính và chụp screenshot.
