# CCRO Document Locator System — User Manual

**City Civil Registrar Office — Archive Locator System**

---

## Table of Contents

1. [User Manual (Public Document Locator)](#1-user-manual-public-document-locator)
2. [Admin Manual](#2-admin-manual)

---

## 1. User Manual (Public Document Locator)

The public Document Locator allows anyone to search for document locations without logging in. Use it to find where a physical certificate box is stored in the archive.

### 1.1 Accessing the Public Locator

1. Open the CCRO Archive Locator application or visit the public URL.
2. You will see the **Document Locator** screen with the header “CCRO Document Locator — Public Search.”
3. No login is required; you can search immediately.

### 1.2 How to Search for a Document

Search uses four fields in this order: **Type of Certificate**, **Year**, **Month**, and **Registry Number**.

**Step 1: Select Type of Certificate**

- Open the **Type of Certificate** dropdown.
- Choose one of:
  - **Birth (COLB)** — Birth certificates
  - **Marriage (COM)** — Marriage certificates
  - **Death (COD)** — Death certificates

**Step 2: Select Year**

- Choose the **Year** from the list (or type it, if the field allows).
- Options depend on registered boxes for the selected certificate type.
- If no years appear, no boxes are registered for that type. Ask an administrator to add boxes.

**Step 3: Select Month**

- Choose the **Month** (January, February, etc.).
- Options depend on registered boxes for the selected type and year.

**Step 4: Enter Registry Number**

- Enter the **Registry Number** (numeric, up to 6 digits).
- A hint shows valid registry ranges for the selected type, year, and month.
- Registry number must be within one of those ranges.

**Step 5: Search**

- Click **Search**.
- If the data is valid, the result shows the physical location.
- Use **Clear** to reset and start over.

### 1.3 Understanding the Search Result

After a successful search you will see:

**Location summary**

- **Bay** — Bay number (e.g., Bay 1, Bay 2).
- **Shelf** — Shelf label (e.g., S-A, S-B).
- **Row** — Row/level label (e.g., R-6, R-5).
- **Box #** — Box number.

**How to read it**

- Go to the **Bay** shown.
- Find the **Shelf** (e.g., S-A).
- Find the **Row** (e.g., R-6).
- The document is in **Box #** listed.

**Search code**

- A unique code for this location (e.g., `COB-2024-B1-S-A-R6-Box#12`).
- Useful for filing or reference.

### 1.4 2D Table and 3D Model Views

The result includes two layout views:

- **2D Table** — Table of bays, shelves, and rows. The matching cell is highlighted.
- **3D Model** — Interactive 3D rack. The location is highlighted.

**3D controls**

- Drag to rotate.
- Scroll to zoom.
- Use **Fullscreen** (if available) to open a larger 3D view.

### 1.5 Fullscreen 3D Preview

- Click **Fullscreen** in the 3D model.
- The 3D view opens in full screen.
- Location details (Bay, Shelf, Row, Box) are shown in the header.
- Click **Close** to return.

### 1.6 Error Messages

- **“Please complete all search fields in order.”** — Fill Type, Year, Month, and Registry Number.
- **“Registry number must be numeric (up to 6 digits).”** — Use only digits.
- **“No matching registered box found for the selected Type/Year/Month.”** — No box is registered for that combination. Ask an admin to add it.
- **“Registry number X does not fall within any registered box's range.”** — The registry number is outside the valid ranges shown. Verify it and try again.
- **“Unable to load document data.”** — The system could not load data. Use **Retry** or try again later.

### 1.7 Login Button

- **Login** in the top-right takes you to the login screen.
- Use it if you have admin credentials and need to manage boxes or settings.

### 1.8 Retry on Load Error

- If you see “Unable to load document data,” click **Retry** to reload.
- If it continues, contact your administrator.

---

## 2. Admin Manual

Administrators manage boxes, locations, and monitor activity. You must log in to access the admin area.

### 2.1 Logging In

1. On the public locator page, click **Login** (top-right).
2. Enter **Username** and **Password**.
3. Click **Login**.
4. If credentials are valid, you are taken to the **Dashboard**.

**Going back**

- Click **“← Back to Document Locator”** on the login page to return to the public locator without logging in.

### 2.2 Admin Layout

After login you see:

- **Header** — Logo and your username and role.
- **Sidebar** — Navigation items:
  - **Dashboard**
  - **Box Management**
  - **Document Locator**
  - **Location Management**
- **Main area** — Content for the selected item.
- **Logout** — At the bottom of the sidebar.

### 2.3 Dashboard

Overview of recent activity and stats.

**Quick Stats**

- **Registered Boxes** — Total number of boxes in the system.

**Activity Log**

- Recent actions (logins, logouts, searches, box add/update/delete).
- Each entry shows type, timestamp, and details (e.g., search code).
- **Clear History** — Removes all activity entries.

### 2.4 Document Locator (Admin)

Same search as the public locator, with these differences:

- Available from the **Document Locator** item in the sidebar.
- Admin searches are recorded in the **Activity Log** on the Dashboard.
- Uses the **active location profile** for bays, shelves, and rows.

Search steps and result display are the same as in the public locator.

### 2.5 Box Management

Register and maintain boxes that the document locator uses.

**Add a new box**

1. Click **Add box**.
2. Complete the form:
   - **Certificate Type** — Birth (COLB), Marriage (COM), or Death (COD).
   - **Year (From)** — Starting year.
   - **Year (To)** — Optional; leave blank for a single year.
   - **Month (From)** — Starting month.
   - **Month (To)** — Optional; leave blank for a single month.
   - **Box Number** — Box identifier.
   - **Bay** — Bay number.
   - **Shelf** — Shelf (e.g., S-A, S-B).
   - **Row / Level** — Row label (e.g., R-6, R-5).
   - **Registry Number Range** — Registry range (e.g., `1-500`, `501-1000`).
   - **Remark** — Optional notes.
3. Click **Save**.
4. Review the confirmation step and click **Confirm**.
5. The box is added and a success message appears.

**Edit a box**

1. In the Registered Boxes table, click **Update** for the box.
2. Change the fields as needed.
3. Click **Save**.

**View a box**

1. Click **View** next to the box.
2. Details open in a modal.
3. Close the modal when done.

**Delete a box**

1. Click **Delete** next to the box.
2. Confirm in the dialog.
3. The box is removed.

**Filter and search**

- **Certificate Type** — Filter by Birth, Marriage, or Death.
- **Search** — Type to search across box number, bay, shelf, row, certificate type, year, month, registry range, remark.

**Pagination**

- Use **Previous** / **Next** and page numbers to move between pages when there are many boxes.

### 2.6 Location Management

Configure how bays, shelves, and rows map to the physical archive layout.

**Location profiles**

- Each profile defines bays, shelves, and rows.
- One profile is **active**; the document locator uses that profile.
- You can create, edit, and delete profiles (you must keep at least one).

**Add Bay**

1. Click **Add bay**.
2. Enter the bay number (must be the next in sequence, e.g., 1, 2, 3…).
3. Click **Add**.

**Add Shelf**

1. Click **Add shelf**.
2. Select the bay.
3. Enter shelf letters (e.g., `A`, `B` or `S-A`, `S-B`). Shelves must be sequential (S-A, S-B, S-C…).
4. Click **Add**.

**Add Rows**

1. Click **Add rows**.
2. Select bay and shelf.
3. Enter row labels (e.g., `R-6`, `R-5`). Rows must be sequential.
4. Click **Add**.

**Edit in place (2D Table)**

- Click a bay header, shelf label, or row label to edit it.
- Enter the new value and press **Enter** or click away.
- Changes stay in the draft until you save.

**Delete**

1. Click **Delete**.
2. Choose what to delete (Bay, Shelf, or Row label).
3. Select the item.
4. Confirm.
5. Changes are in the draft until you save.

**Save changes**

1. After edits, click **Save Changes**.
2. Confirm in the dialog.
3. The active profile is updated.

**2D Table vs 3D Model**

- **2D Table** — Edit bays, shelves, and rows in the table.
- **3D Model** — View the rack in 3D; drag to rotate, scroll to zoom.

### 2.7 Unsaved Changes (Location Management)

- If you switch away from Location Management or log out with unsaved changes, a confirmation appears.
- You can:
  - **Stay & keep editing**
  - **Discard changes**
  - **Save & continue**

### 2.8 Logging Out

1. Click **Logout** at the bottom of the sidebar.
2. You are returned to the public Document Locator page.

---

## Quick Reference

| Action                         | Public User          | Admin                                      |
|--------------------------------|----------------------|--------------------------------------------|
| Search for document location   | Yes                  | Yes (also logged in Activity Log)          |
| View 2D/3D layout              | Yes                  | Yes                                        |
| Fullscreen 3D                  | Yes                  | Yes                                        |
| Login                          | Via Login button     | N/A                                        |
| Manage boxes                   | No                   | Yes (add, edit, delete, view)              |
| Manage location profiles       | No                   | Yes                                        |
| View activity log              | No                   | Yes (Dashboard)                            |
| Clear activity history         | No                   | Yes (Dashboard)                            |

---

## Certificate Types

| Code | Full Name         | Use                                      |
|------|-------------------|------------------------------------------|
| COLB | Birth (COLB)      | Birth certificates                       |
| COM  | Marriage (COM)    | Marriage certificates                    |
| COD  | Death (COD)       | Death certificates                       |

---

## Registry Range Format

- Use a numeric range, e.g., `1-500`, `501-1000`, `1001-1500`.
- Format: `start-end` (both numbers).
- The registry number entered in a search must fall within one of the ranges for the selected type/year/month.

---

*CCRO Document Locator System — City Civil Registrar Office — Archive Locator System*
