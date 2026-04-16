# Uni-Plan Demo Scenario

## Environment

- **URL**: `http://wsu-uniplan.vercel.app/login`
- **Student account**: username `jimin`, password `0000`
- **Admin account**: username `admin1`, password `(ask to our team for security)` 

---

## Part 1: Student Login

1. Open the app URL → the login page appears with Wayne State branding and **Student** mode selected by default.
2. Log in as `jimin` → redirected to `/home` (HomePage).
3. The registered schedule from the previous session is auto-loaded from the server.

---

## Part 2: Course Search & Filtering

4. In the **Course Search** panel, select a term from the dropdown.
5. Type `CSC` in the search bar and press Enter.
   - Results appear with course cards showing subject, course number, CRN, instructor, credits, meeting days/times, and **available seats** badge.
6. Use the **Days** filter to show only courses meeting on **Mon/Wed**.
7. Use the **Credits** filter to narrow results to **3-credit** courses.
8. Use the **Instructor** filter to search for a specific instructor name.
9. Click the **Sort** dropdown and sort by **Credits**.
10. Verify **pagination** at the bottom — navigate to page 2 and back.
11. Click on a course card to open the **Course Details** modal → review detailed info → close the modal.

---

## Part 3: Building a Schedule

12. Clear all filters. Search for `CSC` courses.
13. Click **Add** on a course → it appears in **My Schedule** (left panel) and on the **Weekly Schedule** grid.
14. Add more courses and observe:
    - **My Schedule** shows the credit badge updating (e.g., `6 / 18`).
    - **Weekly Schedule** renders colored blocks for each course on the correct days/times.
15. **Conflict detection**: Add a course whose time overlaps with an already-added course.
    - A conflict warning appears when adding.
    - Conflicting blocks are highlighted in **red** on the Weekly Schedule.
    - A **conflict banner** appears at the top of the Weekly Schedule.
16. **Credit limit**: Keep adding courses until total credits approach 18.
    - Attempting to add a course that would exceed **18 credits** shows an error toast and blocks the addition.
    - The credit badge in My Schedule turns **red** at 18 credits.
17. Remove the conflicting course by clicking **Remove** in My Schedule.

---

## Part 4: Save & Load Plans

18. Click **Save Plan** in the header.
    - Enter plan name: `Demo Plan` and term.
    - Click Save → success confirmation.
19. Remove all courses from the current schedule.
20. Click **Load Plan** in the header.
    - A list of saved plans appears (including `Demo Plan`).
    - Select `Demo Plan` → the saved courses reload into the schedule.

---

## Part 5: Register Courses

21. With a valid schedule loaded (single term, no mixed terms), click **Register**.
22. Confirm the registration prompt → courses are persisted as the registered schedule on the server.
23. The registered seat counts update on the backend.

---

## Part 6: Quick Planner

24. Click **Quick Planner** in the header → full-screen modal opens.
25. **Add course groups**:
    - Group 1: Search `CSC 1100` → add a section as an option.
    - Group 2: Search `CSC 2110` → add a section as an option.
    - Group 3: Search `MAT` → add multiple sections as alternatives within the same group.
26. **Set preferences**:
    - Toggle **Friday Off** preference.
    - Toggle **No Morning Classes** preference.
27. Click **Generate** → the system returns conflict-free schedule combinations.
28. **Browse generated plans**: Use pagination (Next / Previous) to view different generated options.
29. Click **Regenerate** to cycle through additional pages of results.
30. **Compare plans**: Select two generated plans and click **Compare** → side-by-side mini weekly grids appear showing both plans.
31. Pick the preferred plan and click **Apply Plan** → the selected schedule replaces the current schedule on the main HomePage. The Quick Planner modal closes.
32. Verify the applied schedule appears correctly in My Schedule and Weekly Schedule.

---

## Part 7: PDF Export

33. With courses displayed on the Weekly Schedule, click the **Export** button.
34. A PDF is generated and downloaded containing:
    - The weekly schedule grid with proper course coloring.
    - Conflict highlighting (if any conflicts exist).
    - Credit summary.

---

## Part 8: Admin Force Register (Credit Override Scenario)

> This section demonstrates admin override that bypasses the 18-credit cap.

35. **Log out** from the student account (click user menu → Logout).
36. On the login page, switch to **Administrator** mode.
37. Log in as `admin1` → redirected to `/admin` (Admin Page).
38. In the **Student ID** field, enter `jimin` and click **Search**.
39. The admin panel loads `jimin`'s currently **registered** schedule.
40. The admin can see all of jimin's registered courses displayed in the schedule grid.
41. **Add courses beyond 18 credits**:
    - Use the Course Search panel (which has `bypassCreditLimit` enabled in admin mode).
    - Add courses until the total credits **exceed 18** — no error is shown because the admin bypasses the credit cap.
    - The credit display shows the overridden total (e.g., `21 / 18`) with an **(override)** label and **red** styling.
42. Click **Force Save** → the overridden schedule is saved as jimin's registered schedule.
43. Confirm the success message.

---

## Part 9: Verify Override as Student

44. **Log out** from the admin account.
45. Switch back to **Student** mode on the login page.
46. Log in again as `jimin` → redirected to `/home`.
47. The page auto-loads the registered schedule from the server.
48. **Refresh the page** (F5 / Cmd+R) to confirm data persists.
49. Verify the schedule now shows **more than 18 credits** (e.g., `21 / 18`):
    - The **credit badge** in My Schedule is **red**.
    - The **Weekly Schedule** footer shows the exceeded credit total in **red**.
    - The student **cannot add** more courses (still capped by the student-side 18-credit rule), but the admin-overridden courses remain.

---

## Part 10: Final Cleanup & Logout

50. Optionally remove extra courses to bring credits back under 18.
51. Click **Register** to save the updated schedule.
52. Click the user menu → **Logout** → redirected back to `/login`.
53. Verify that navigating to `/home` or `/admin` directly redirects back to `/login` (auth guard).

---

## Feature Coverage Summary

| # | Feature | Covered In |
|---|---------|-----------|
| 1 | Student login / role-based routing | Part 1 |
| 2 | Auto-load registered schedule | Part 1 (step 3) |
| 3 | Course search with term selection | Part 2 |
| 4 | Filtering (days, credits, instructor) | Part 2 |
| 5 | Sorting & pagination | Part 2 |
| 6 | Available seats display | Part 2 (step 5) |
| 7 | Course details modal | Part 2 (step 11) |
| 8 | Add/remove courses | Part 3 |
| 9 | My Schedule with credit badge | Part 3 |
| 10 | Weekly Schedule grid rendering | Part 3 |
| 11 | Time conflict detection & highlighting | Part 3 (step 15) |
| 12 | Conflict banner | Part 3 (step 15) |
| 13 | 18-credit limit enforcement (student) | Part 3 (step 16) |
| 14 | Save plan | Part 4 |
| 15 | Load plan | Part 4 |
| 16 | Register courses | Part 5 |
| 17 | Quick Planner: course groups | Part 6 (step 25) |
| 18 | Quick Planner: preferences (Friday off, no morning) | Part 6 (step 26) |
| 19 | Quick Planner: generate schedules | Part 6 (step 27) |
| 20 | Quick Planner: pagination & regenerate | Part 6 (steps 28–29) |
| 21 | Quick Planner: compare plans side-by-side | Part 6 (step 30) |
| 22 | Quick Planner: apply plan | Part 6 (step 31) |
| 23 | PDF export | Part 7 |
| 24 | Admin login / admin mode | Part 8 (steps 36–37) |
| 25 | Admin: search student & load registered schedule | Part 8 (steps 38–40) |
| 26 | Admin: bypass credit limit (override) | Part 8 (step 41) |
| 27 | Admin: force save registered schedule | Part 8 (step 42) |
| 28 | Student sees admin-overridden schedule (>18 credits) | Part 9 |
| 29 | Auth guard (redirect unauthenticated users) | Part 10 (step 53) |
| 30 | Logout | Part 10 |
