-- Mark teams that existed before admin-approval workflow as approved
UPDATE "Team" SET "approvalStatus" = 'APPROVED' WHERE "approvalStatus" = 'PENDING';
UPDATE "Team" SET "hiring" = 'ACTIVE' WHERE "approvalStatus" = 'APPROVED' AND "hiring" = 'INACTIVE';
