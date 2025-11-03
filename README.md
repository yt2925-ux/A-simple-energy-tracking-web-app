# Energy Manager

## 1. Chosen Architecture
I chose **Option A: Separate HTML files** for each page.

### Reason
This approach is easier for beginners to understand and manage.  
Each page (`index.html`, `log.html`, `activities.html`) is a standalone file, and navigation between them uses simple HTML links (`<a>` tags).  
It also allows testing each page independently without complex JavaScript or frameworks.

---

## 2. Pages / Sections
The project currently includes the following pages:

| Page | File | Description |
|------|------|-------------|
| Overview | `index.html` | Displays today’s energy and remaining energy summary |
| Log | `log.html` | Shows a list of past daily energy logs |
| Activities | `activities.html` | Lists activities that affect energy (e.g., exercise, study, rest) |

---

## 3. Navigation Design
The navigation system is consistent across all pages.  
Users can switch between sections using the top navigation bar:

```html
<nav>
  <a href="index.html">Overview</a>
  <a href="log.html">Log</a>
  <a href="activities.html">Activities</a>
</nav>