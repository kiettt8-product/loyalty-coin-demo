# Loyalty Coin Campaign Demo

Prototype HTML/CSS/JS dùng cho buổi grooming. UI bám theo Figma `[Zalopay] CRM Design`, gồm flow Loyalty Coin và Promotion Code.

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

1. Promotion Code: List mặc định với search/filter, code display cho Mass/Unique Code, action theo status.
2. Promotion Code: Create/Edit/View cho Single Reward theo PRD 2026, gồm MKT mapping, Reward Info, Display Users, Reward Active Time, Apply Limit và Budget Alert.
3. Promotion Code: Unique Code states gồm `Processing`, `Retry` khi generate lỗi và `Export Code` khi ready.
4. Promo Asset Campaign: Campaign List → Add new → chọn Distribute Massive → Massive form.
5. Promo Asset Campaign: Campaign List → Add new → chọn Distribute coin based on action trigger → Create Loyalty Coin Campaign.
   Tại Create page có thể đổi `Distribution Type` qua lại giữa Coin và Massive.
6. Loyalty Coin Campaign List: Search, Reset, Collapse, View và Edit.
7. Create Loyalty Coin Campaign: Shared/Non-shared budget, Control by Campaign/Package.
8. Distribution Package: By Budget, Add/Remove, max 10 package và tự tính budget.
9. Budget Alert: nhập username/email và threshold bằng phím Enter.
10. Submit: Auto Approved hoặc FA Review theo Coin Per User.
11. Generate Package ID: mô phỏng all package thành công sau Auto Approved.
12. Trigger Based Campaign: chọn Campaign trước, sau đó Package ID mới được enable và load đúng package.
13. Others: mở submenu `AI Generate Banner` (placeholder) và `Coin to Direct Discount`.
14. Coin to Direct Discount: xem Total/Spent/Remaining Budget, cấu hình conversion rate, chọn Applicable/Non-Applicable App ID bằng searchable multi-select và bật/tắt future configuration khi demo.

`qa-promotion.mjs` kiểm tra Promotion Code flow. `qa.mjs` kiểm tra Loyalty Coin flow. `qa-asset.mjs` kiểm tra Promo Asset Massive và Coin Create flow.
