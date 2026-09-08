# Security Specification for ParrotMoney AI Home Loans

This document defines the security boundaries, data invariants, and negative test payloads ("Dirty Dozen") for the application's Firestore database, adhering to the Zero-Trust Architecture guidelines specified in the Firebase Integration Skill.

## 1. Data Invariants

1. **User Profile (`/users/{userId}`)**:
   - `id` must match the path variable `{userId}`.
   - `role` must be one of `['client', 'staff', 'admin']`.
   - `email` must be a valid email string format.

2. **Loan Application (`/loans/{loanId}`)**:
   - Must contain a valid, non-empty `userId`.
   - `status` must be one of `['draft', 'submitted', 'pending_review', 'approved', 'rejected']`.

3. **Document (`/loans/{loanId}/documents/{docId}`)**:
   - Must belong to a valid loan application of the user.
   - `status` must be one of `['pending', 'verified', 'rejected']`.

4. **Notification (`/users/{userId}/notifications/{notifId}`)**:
   - Must belong to the user corresponding to `{userId}`.

5. **Lender Rating (`/lenderRatings/{ratingId}`)**:
   - Must contain a valid `rating` (numeric between 1 and 5).

---

## 2. The "Dirty Dozen" Malicious Payloads

The following payloads represent illegal database states or unauthorized operations that MUST be rejected:

### Payload 1: Unauthorized Role Escalation (User)
Attempt to write/update user profile with an `admin` role by a non-admin client.
```json
{
  "id": "guest_12345",
  "name": "Malicious Guest",
  "email": "attacker@example.com",
  "role": "admin",
  "createdAt": "2026-05-27T16:23:00Z"
}
```

### Payload 2: Hostile ID Matching Bypass
Writing to user profile where JSON body `id` doesn't match the path parameter `{userId}`.
```json
{
  "id": "different_id_99999",
  "name": "Spoofed User",
  "email": "user@example.com",
  "role": "client",
  "createdAt": "2026-05-27T16:23:00Z"
}
```

### Payload 3: Injection of Ghost Fields (Shadow Update)
Adding unexpected fields like `isApproved` to a user/loan document.
```json
{
  "userId": "guest_12345",
  "status": "submitted",
  "createdAt": "2026-05-27T16:23:00Z",
  "updatedAt": "2026-05-27T16:23:00Z",
  "isApproved": true
}
```

### Payload 4: Invalid Status Transition (Terminal State Lock Bypass)
Attempt to move a completed/rejected status back to draft.
```json
{
  "userId": "guest_12345",
  "status": "draft",
  "createdAt": "2026-05-27T16:23:00Z",
  "updatedAt": "2026-05-27T16:23:00Z"
}
```

### Payload 5: Denying Wallet via massive string values
Infiltrating fields with extremely large strings to consume storage/bandwidth resources.
```json
{
  "userId": "guest_12345",
  "status": "submitted",
  "createdAt": "2026-05-27T16:23:00Z",
  "updatedAt": "2026-05-27T16:23:00Z",
  "city": "A".repeat(1000000)
}
```

### Payload 6: Spoofing user on Loan ownership
Creating a loan application where the `userId` field belongs to another active user.
```json
{
  "userId": "guest_victim_user_id",
  "status": "draft",
  "createdAt": "2026-05-27T16:23:00Z",
  "updatedAt": "2026-05-27T16:23:00Z"
}
```

### Payload 7: Invalid Rating limits
Creating a lender review rating outside the boundary 1 to 5 (e.g. 100).
```json
{
  "lenderName": "SBI Mortgages",
  "userId": "guest_12345",
  "loanId": "loan_1",
  "rating": 100,
  "comment": "Injected rating",
  "createdAt": "2026-05-27T16:23:00Z"
}
```

### Payload 8: Null pointer ID injection
Attempt to use empty string or illegal chars as document ID to break path routing.
```json
{
  "id": "!!!illegal_chars!!!",
  "name": "Corrupted profile"
}
```

### Payload 9: Orphaned Documents Creation
Deploying sub-collection loans documents under a non-existent loan ID.
```json
{
  "id": "doc_1",
  "loanId": "non_existent_unregistered_loan_id",
  "name": "Pan Card",
  "type": "pan",
  "url": "https://firebase.storage/sample.png",
  "status": "pending",
  "uploadedAt": "2026-05-27T16:23:00Z"
}
```

### Payload 10: Modifying immutable tracking timestamp
Updating `createdAt` to falsify application timeline.
```json
{
  "userId": "guest_12345",
  "status": "submitted",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2026-05-27T16:23:00Z"
}
```

### Payload 11: Spoofed email address formats
Writing arbitrary strings in email fields.
```json
{
  "id": "guest_12345",
  "name": "Invalid user",
  "email": "not_an_email_address",
  "role": "client",
  "createdAt": "2026-05-27T16:23:00Z"
}
```

### Payload 12: Bypassing Notification scope
Inserting notification under someone else's userId.
```json
{
  "id": "notif_1",
  "userId": "guest_another_user_id",
  "title": "Alert",
  "message": "You are hacked",
  "type": "alert",
  "read": false,
  "createdAt": "2026-05-27T16:23:00Z"
}
```
