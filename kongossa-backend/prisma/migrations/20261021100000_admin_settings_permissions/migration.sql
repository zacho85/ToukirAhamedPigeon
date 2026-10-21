-- R5: changing fees (POST /system-settings) and exchange rates (POST /exchange-rate/rate)
-- now needs update:fee-management / update:currency-exchange instead of any login.
-- Customers already hold read:currency-exchange, so a read permission would not be enough.
INSERT INTO "Permission" ("action", "resource", "name", "description", "updatedAt")
VALUES ('update', 'fee-management', 'update_fee_management', 'update fee-management', CURRENT_TIMESTAMP),
       ('update', 'currency-exchange', 'update_currency_exchange', 'update currency-exchange', CURRENT_TIMESTAMP)
ON CONFLICT ("action", "resource") DO NOTHING;

-- Fees and exchange rates are central decisions: only superadmin holds these.
-- The admin role does not get them.
INSERT INTO "RolePermission" ("roleId", "permissionId")
SELECT r."id", p."id"
FROM "Role" r
CROSS JOIN "Permission" p
WHERE r."name" = 'superadmin'
  AND p."action" = 'update'
  AND p."resource" IN ('fee-management', 'currency-exchange')
ON CONFLICT ("roleId", "permissionId") DO NOTHING;
