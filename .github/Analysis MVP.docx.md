**MVP Analysis for a Strength Training Log Application**

**Application Goal and General Assumptions**

The web application is intended to serve as a tool for tracking progress in strength training, with an emphasis on **minimalism** and **ease of maintenance**. According to best practices for creating MVPs, the application should focus on solving the main user problem—efficient logging and analysis of strength training sessions.

**Target User Analysis**

The primary target groups are:

* **Beginners** — need a simple way to start tracking progress

* **Advanced users** — require detailed data for progression analysis

**Key MVP Features**

**Basic Features (Must-Have)**

**1\. User System**

* Registration and login

* Basic user profile (age, weight, height)

* Secure data storage (JWT authentication)

**2\. Training Logging**

* Creation of training sessions with date and time

* Adding exercises to the workout

* Logging sets, repetitions, and weights

**3\. Exercise Database**

* Predefined list of popular strength exercises

* Ability to add custom exercises

**4\. Progress Tracking**

* History of completed workouts

* Personal records (highest weights)

* Basic progression charts

**Additional Features (Nice-to-Have)**

**5\. Training Planning**

* Creating training templates

* Copying previous sessions

**User Stories for MVP**

**Epic 1: User Account Management**

As a user, I want to create an account so I can securely store my training data

**Acceptance Criteria:**

* Registration with email and password

* Input data validation

* Registration confirmation

* Login and logout

**Epic 2: Workout Logging**

As a trainee, I want to log my workout to track progress over time

**Acceptance Criteria:**

* Starting a new training session

* Selecting exercises from a list

* Logging sets with weight and repetitions

* Saving the entire workout

**Epic 3: Progress Analysis**

As a user, I want to see my progress to know if I am making gains

**Acceptance Criteria:**

* Displaying workout history

* Showing personal records

* Simple progression charts for key exercises

**Data Structure \- Basic Schema**

**Main Entities:**

**Users**

* id, email, password\_hash, name, weight, height, created\_at

**Exercises**

* id, name

**Workouts**

* id, user\_id, date, duration, notes

**Workout\_Sets**

* id, workout\_id, exercise\_id, set\_number, weight, reps

**Personal\_Records**

* id, user\_id, exercise\_id, weight, reps, date\_achieved

**Technical Architecture \- Recommendations**

**Frontend**

* **React**

* **CSS Framework** \- Bootstrap or Tailwind for rapid prototyping

**Backend**

* **Java Spring**

* **JWT authentication** for security

* **RESTful API** for easy frontend integration

**Database**

* **PostgreSQL** \- relational, stable, scalable

* **Redis** \- cache for user sessions

**Key Design Assumptions**

1. **Logging speed** — maximum 30 seconds to log a full workout

2. **Minimalist UI** — focus on functionality, not visual effects

3. **Technical performance** — loading time \< 2 seconds