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

1. Promo Asset Campaign: Campaign List → Add new → chọn Distribute Massive → Massive form.
2. Loyalty Coin Campaign List: Search, Reset, Collapse, View và Edit.
3. Create Loyalty Coin Campaign: Shared/Non-shared budget, Control by Campaign/Package.
4. Distribution Package: By Budget, Add/Remove, max 10 package và tự tính budget.
5. Budget Alert: nhập username/email và threshold bằng phím Enter.
6. Submit: Auto Approved hoặc FA Review theo Coin Per User.
7. Generate Present ID: mô phỏng all package thành công sau Auto Approved.
8. Trigger Based Campaign: chọn Campaign trước, sau đó Present ID mới được enable và load đúng package.

`qa.mjs` kiểm tra Loyalty Coin flow. `qa-asset.mjs` kiểm tra Promo Asset flow và chụp ba state đối chiếu Figma.
