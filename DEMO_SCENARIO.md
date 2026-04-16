# Uni-Plan Demo Scenario

## Environment

- **URL**: http://wsu-uniplan.vercel.app/
- **Student account**: username `jimin`, password `(ask to our team for security)` 
- **Admin account**: username `admin1`, password `(ask to our team for security)` 

---

## Part 1: Student Login

1. Open the app URL → the login page appears with Wayne State branding and **Student** mode selected by default
<img width="1416" height="647" alt="Screenshot 2026-04-15 at 11 37 33 PM" src="https://github.com/user-attachments/assets/e981c8ae-8826-4693-9f20-5738e6f74d91" />

2. Log in as `jimin` → redirected to `/home` (HomePage).
<img width="1413" height="783" alt="Screenshot 2026-04-15 at 11 38 11 PM" src="https://github.com/user-attachments/assets/58b28551-a48d-463b-a2b1-a7b283527c0e" />

3. The registered schedule from the previous session is auto-loaded from the server
<img width="1443" height="776" alt="Screenshot 2026-04-15 at 11 39 06 PM" src="https://github.com/user-attachments/assets/c1a2270e-9f8c-4433-9e4b-93527f2f60cc" />


---

## Part 2: Course Search & Filtering

4. In the **Course Search** panel, select a term from the dropdown.
<img width="759" height="119" alt="Screenshot 2026-04-15 at 11 39 50 PM" src="https://github.com/user-attachments/assets/7847533f-baa8-4b0d-b602-8c17085e1aa6" />

5. Type `CSC` in the search bar and press Enter.
   - Results appear with course cards showing subject, course number, CRN, instructor, credits, meeting days/times, and **available seats** badge.
   <img width="809" height="720" alt="Screenshot 2026-04-15 at 11 40 29 PM" src="https://github.com/user-attachments/assets/d1e360f4-f789-4f49-97ba-13779e0751de" />

6. Use the **Days** filter to show only courses meeting on **Tue/Thu**.
<img width="813" height="630" alt="Screenshot 2026-04-15 at 11 41 16 PM" src="https://github.com/user-attachments/assets/554bc9d6-224c-4343-9583-a5e4ed427b76" />

7. Use the **Credits** filter to narrow results to **3-credit** courses.
<img width="795" height="505" alt="Screenshot 2026-04-15 at 11 41 43 PM" src="https://github.com/user-attachments/assets/d60c3b4a-d7df-40ca-8a23-2f37ab218f89" />

8. Use the **Instructor** filter to search for a specific instructor name.
<img width="811" height="386" alt="Screenshot 2026-04-15 at 11 41 59 PM" src="https://github.com/user-attachments/assets/638bc248-0d81-487b-a0ad-b2b1c70521e8" />

9. Click the **Sort** dropdown and sort by **Credits**.
10. Verify **pagination** at the bottom — navigate to page 2 and back.
<img width="818" height="192" alt="Screenshot 2026-04-15 at 11 42 22 PM" src="https://github.com/user-attachments/assets/469b8fc3-239f-48d2-9ea5-5db620574c9a" />

11. Click on a course card to open the **Course Details** modal → review detailed info → close the modal.
<img width="1338" height="708" alt="Screenshot 2026-04-15 at 11 42 42 PM" src="https://github.com/user-attachments/assets/a8f89e13-eb10-4b13-82ac-5f268855e09c" />


---

## Part 3: Building a Schedule

12. Clear all filters. Search for `CSC` courses.
13. Click **Add** on a course → it appears in **My Schedule** (left panel) and on the **Weekly Schedule** grid.
<img width="1358" height="562" alt="Screenshot 2026-04-15 at 11 43 29 PM" src="https://github.com/user-attachments/assets/60824c38-cabf-4158-a073-4e590e0e121b" />

14. Add more courses and observe:
    - **My Schedule** shows the credit badge updating (e.g., `6 / 18`).
    - **Weekly Schedule** renders colored blocks for each course on the correct days/times.
    <img width="625" height="337" alt="Screenshot 2026-04-15 at 11 43 51 PM" src="https://github.com/user-attachments/assets/a142b903-6a44-41e8-8f45-10b7d79e9706" />

15. **Conflict detection**: Add a course whose time overlaps with an already-added course.
    - A conflict warning appears when adding.
    - Conflicting blocks are highlighted in **red** on the Weekly Schedule.
    - - A **conflict banner** appears at the top of the Weekly Schedule.
    <img width="1452" height="801" alt="Screenshot 2026-04-15 at 11 44 14 PM" src="https://github.com/user-attachments/assets/22eaa161-9f85-43eb-ae5d-f4f3aaae1356" />

16. **Credit limit**: Keep adding courses until total credits approach 18.
    - Attempting to add a course that would exceed **18 credits** shows an error toast and blocks the addition.
    - The credit badge in My Schedule turns **red** at 18 credits.
    <img width="623" height="712" alt="Screenshot 2026-04-15 at 11 45 31 PM" src="https://github.com/user-attachments/assets/81d4034e-5ece-4fa8-9f11-67e25d3bc9b1" />

17. Remove the conflicting course by clicking **Remove** in My Schedule.

---

## Part 4: Save & Load Plans

18. Click **Save Plan** in the header.
    - Enter plan name: `Demo Plan` and term.

<img width="523" height="371" alt="Screenshot 2026-04-16 at 12 42 53 AM" src="https://github.com/user-attachments/assets/e86458e7-7607-4f9b-a889-0e2e0643b031" />

   - Click Save → success confirmation.
   
<img width="458" height="145" alt="Screenshot 2026-04-16 at 12 13 24 AM" src="https://github.com/user-attachments/assets/dd51098a-2457-48f8-b2a9-2e104de0d102" />


    
19. Remove all courses from the current schedule.

20. Click **Load Plan** in the header.
    - A list of saved plans appears (including `Demo Plan`).
    - Select `Demo Plan` → the saved courses reload into the schedule.

https://github.com/user-attachments/assets/e5592da3-7375-42e5-a870-9fb8699cc274


---

## Part 5: Register Courses

21. With a valid schedule loaded (single term, no mixed terms), click **Register**.
22. Confirm the registration prompt → courses are persisted as the registered schedule on the server.

<img width="526" height="247" alt="Screenshot 2026-04-16 at 12 44 00 AM" src="https://github.com/user-attachments/assets/0a9c2eaa-5026-4a57-b319-44a71654e378" />

23. The registered seat counts update on the backend.

<img width="193" height="129" alt="Screenshot 2026-04-16 at 12 44 22 AM" src="https://github.com/user-attachments/assets/062af785-a69d-4a24-82b2-966edb7dc72c" />


---

## Part 6: Quick Planner

24. Click **Quick Planner** in the header → full-screen modal opens.


<img width="477" height="64" alt="Screenshot 2026-04-16 at 12 44 40 AM" src="https://github.com/user-attachments/assets/56aaa8bc-4edb-4fcd-9443-c1a9727f6668" />

25. **Add course groups**:
    - Group 1: Search `CSC 1000` `CSC 1002` → add a section as an option.
    - Group 2: Search `CSC 1050` `CSC 1100` `CSC1500` → add a section as an option.
    - Group 3: Search `MAT` → add multiple sections as alternatives within the same group.
    
26. **Set preferences**:
    - Toggle **Friday Off** preference.
    - Toggle **No Morning Classes** preference.
27. Click **Generate** → the system returns conflict-free schedule combinations.

https://github.com/user-attachments/assets/a76d5c4e-97b5-4ad5-8852-c81881ce4b5b


28. **Browse generated plans**: You can see only 6 plans at once.
<img width="868" height="644" alt="Screenshot 2026-04-16 at 12 47 55 AM" src="https://github.com/user-attachments/assets/d1b5764b-a057-41e9-a329-b182cfa8508e" />
29. Click **Regenerate** to cycle through additional pages of results.

https://github.com/user-attachments/assets/3880af83-9302-47d7-a493-96b82e571766

30. **Compare plans**: Select two generated plans and click **Compare** → side-by-side mini weekly grids appear showing both plans.
31. Pick the preferred plan and click **Apply Plan** → the selected schedule replaces the current schedule on the main HomePage. The Quick Planner modal closes.

https://github.com/user-attachments/assets/7555d464-0798-4027-adaf-a24e850a6f65

32. Verify the applied schedule appears correctly in My Schedule and Weekly Schedule.

---

## Part 7: PDF Export

33. With courses displayed on the Weekly Schedule, click the **Download PDF** button.
<img width="616" height="120" alt="Screenshot 2026-04-16 at 12 50 27 AM" src="https://github.com/user-attachments/assets/6e29344a-38bd-4491-964d-60a947cb13d7" />
<img width="1466" height="789" alt="Screenshot 2026-04-16 at 12 50 51 AM" src="https://github.com/user-attachments/assets/89fa68a1-1cde-4a52-b11f-76ed8db102e8" />

34. A PDF is generated and downloaded containing:
    - The weekly schedule grid with proper course coloring.
    - Conflict highlighting (if any conflicts exist).
    - Credit summary.


---

## Part 8: Admin Force Register (Credit Override Scenario)

> This section demonstrates admin override that bypasses the 18-credit cap.

35. **Log out** from the student account (click user menu → Logout).
<img width="479" height="149" alt="Screenshot 2026-04-16 at 12 57 33 AM" src="https://github.com/user-attachments/assets/0d05b266-1141-4f3e-ad29-f11cb512276c" />


36. On the login page, switch to **Administrator** mode.
<img width="181" height="103" alt="Screenshot 2026-04-16 at 12 57 22 AM" src="https://github.com/user-attachments/assets/01599cff-cf59-4d4e-833b-1f27b5578e10" />
<img width="588" height="541" alt="Screenshot 2026-04-16 at 12 57 56 AM" src="https://github.com/user-attachments/assets/e49741fa-afbb-48f6-8aac-f1021316d55e" />

37. Log in as `admin1` → redirected to `/admin` (Admin Page).
<img width="1419" height="704" alt="Screenshot 2026-04-16 at 12 58 22 AM" src="https://github.com/user-attachments/assets/e3be22db-ccf9-44a0-8faf-f0b592feb6ff" />

38. In the **Student ID** field, enter `jimin` and click **Search**.
39. The admin panel loads `jimin`'s currently **registered** schedule.
<img width="1047" height="704" alt="Screenshot 2026-04-16 at 12 58 38 AM" src="https://github.com/user-attachments/assets/c727f7c7-3968-4f21-bb18-69be37e6af39" />

40. The admin can see all of jimin's registered courses displayed in the schedule grid.
41. **Add courses beyond 18 credits**:
    - Use the Course Search panel (which has `bypassCreditLimit` enabled in admin mode).
    - Add courses until the total credits **exceed 18** — no error is shown because the admin bypasses the credit cap.
    - The credit display shows the overridden total (e.g., `21 / 18`) with an **(override)** label and **red** styling.
    

42. Click **Force Save** → the overridden schedule is saved as jimin's registered schedule.
43. Confirm the success message.

https://github.com/user-attachments/assets/7fd3838e-9e06-41e5-8c57-050b0005c621


---

## Part 9: Verify Override as Student

44. **Log out** from the admin account.
45. Switch back to **Student** mode on the login page.
46. Log in again as `jimin` → redirected to `/home`.
47. The page auto-loads the registered schedule from the server.
48. **Refresh the page** (F5 / Cmd+R) to confirm data persists.


https://github.com/user-attachments/assets/6935558b-7423-4025-b1b0-f77a82906992


49. Verify the schedule now shows **more than 18 credits** (e.g., `21 / 18`):
    - The student **cannot add** more courses (still capped by the student-side 18-credit rule), but the admin-overridden courses remain.

---

## Part 10: Final Cleanup & Logout

50. Optionally remove extra courses to bring credits back under 18.
51. Click **Register** to save the updated schedule.
52. Click the user menu → **Logout** → redirected back to `/login`.

https://github.com/user-attachments/assets/2f0270a2-b7b7-4521-ba0e-3cc6fb4d9054


53. Verify that navigating to `/home` or `/admin` directly redirects back to `/login` (auth guard).
- students cannot access the admin panel, and admins cannot access the student registration page.

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
