  
**Low-Level Design (LLD) \- MVP Strength Training Logging Application**

**1\. Architecture Overview**

**1.1 Technology Stack**

* **Frontend**: React 18.2+ with functional components and Hooks

* **Backend**: Spring Boot 3.1+ with Java 17

* **Database**: PostgreSQL 15+

* **Cache**: Redis (optional for sessions)

* **Authentication**: JWT (JSON Web Tokens)

* **Build tools**: Maven (backend), npm/Vite (frontend)

* **Deployment**: Docker containers on Raspberry Pi Zero 2 W

**1.2 Platform Constraints (Raspberry Pi Zero 2 W)**

* **CPU**: Quad-core ARM Cortex-A53 1GHz

* **RAM**: 512MB

* **Storage**: microSD (recommended Class 10, min 16GB)

* **Required optimizations**: minimal heap size, connection pooling, DB indexes

**2\. Detailed Database Schema**

**2.1 Tables and Relations**

`-- Users table`  
`CREATE TABLE users (`  
    `id BIGSERIAL PRIMARY KEY,`  
    `email VARCHAR(255) UNIQUE NOT NULL,`  
    `password_hash VARCHAR(255) NOT NULL,`  
    `name VARCHAR(100) NOT NULL,`  
    `weight DECIMAL(5,2),`  
    `height INTEGER,`  
    `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`  
    `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`  
`);`

`-- Exercises table`  
`CREATE TABLE exercises (`  
    `id BIGSERIAL PRIMARY KEY,`  
    `name VARCHAR(255) NOT NULL,`  
    `muscle_group VARCHAR(100),`  
    `is_custom BOOLEAN DEFAULT FALSE,`  
    `user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,`  
    `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`  
`);`

`-- Workouts table`  
`CREATE TABLE workouts (`  
    `id BIGSERIAL PRIMARY KEY,`  
    `user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,`  
    `date DATE NOT NULL,`  
    `start_time TIMESTAMP,`  
    `end_time TIMESTAMP,`  
    `notes TEXT,`  
    `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`  
`);`

`-- Workout sets table`  
`CREATE TABLE workout_sets (`  
    `id BIGSERIAL PRIMARY KEY,`  
    `workout_id BIGINT NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,`  
    `exercise_id BIGINT NOT NULL REFERENCES exercises(id),`  
    `set_number INTEGER NOT NULL,`  
    `weight DECIMAL(6,2) NOT NULL,`  
    `reps INTEGER NOT NULL,`  
    `rest_seconds INTEGER,`  
    `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`  
`);`

`-- Personal records table`  
`CREATE TABLE personal_records (`  
    `id BIGSERIAL PRIMARY KEY,`  
    `user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,`  
    `exercise_id BIGINT NOT NULL REFERENCES exercises(id),`  
    `weight DECIMAL(6,2) NOT NULL,`  
    `reps INTEGER NOT NULL,`  
    `date_achieved DATE NOT NULL,`  
    `workout_id BIGINT REFERENCES workouts(id),`  
    `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,`  
    `UNIQUE(user_id, exercise_id, weight, reps)`  
`);`

**2.2 Indexes for Performance**

`-- Main indexes`  
`CREATE INDEX idx_workouts_user_date ON workouts(user_id, date DESC);`  
`CREATE INDEX idx_workout_sets_workout ON workout_sets(workout_id);`  
`CREATE INDEX idx_workout_sets_exercise ON workout_sets(exercise_id);`  
`CREATE INDEX idx_personal_records_user_exercise ON personal_records(user_id, exercise_id);`  
`CREATE INDEX idx_exercises_user ON exercises(user_id);`

**2.3 Seed Data**

`-- Basic exercises`  
`INSERT INTO exercises (name, muscle_group, is_custom) VALUES`  
`('Barbell Squat', 'Legs', FALSE),`  
`('Deadlift', 'Back', FALSE),`  
`('Bench Press', 'Chest', FALSE),`  
`('Overhead Press', 'Shoulders', FALSE),`  
`('Pull-up', 'Back', FALSE),`  
`('Push-ups', 'Chest', FALSE);`

**3\. API Documentation**

**3.1 Authentication Endpoints**

`POST /api/auth/register`  
`Content-Type: application/json`

`Request:`  
`{`  
    `"email": "user@example.com",`  
    `"password": "password123",`  
    `"name": "John Smith",`  
    `"weight": 75.5,`  
    `"height": 180`  
`}`

`Response (201):`  
`{`  
    `"id": 1,`  
    `"email": "user@example.com",`  
    `"name": "John Smith",`  
    `"token": "eyJhbGciOiJIUzI1NiIs..."`  
`}`

`POST /api/auth/login`  
`Content-Type: application/json`

`Request:`  
`{`  
    `"email": "user@example.com",`  
    `"password": "password123"`  
`}`

`Response (200):`  
`{`  
    `"id": 1,`  
    `"email": "user@example.com",`  
    `"name": "John Smith",`  
    `"token": "eyJhbGciOiJIUzI1NiIs..."`  
`}`

**3.2 User Management**

`GET /api/users/profile`  
`Authorization: Bearer {token}`

`Response (200):`  
`{`  
    `"id": 1,`  
    `"email": "user@example.com",`  
    `"name": "John Smith",`  
    `"weight": 75.5,`  
    `"height": 180,`  
    `"createdAt": "2025-08-31T15:30:00Z"`  
`}`

`PUT /api/users/profile`  
`Authorization: Bearer {token}`  
`Content-Type: application/json`

`Request:`  
`{`  
    `"name": "John Smith",`  
    `"weight": 76.0,`  
    `"height": 180`  
`}`

`Response (200):`  
`{`  
    `"message": "Profile updated successfully"`  
`}`

**3.3 Exercises Management**

`GET /api/exercises`  
`Authorization: Bearer {token}`

`Response (200):`  
`[`  
    `{`  
        `"id": 1,`  
        `"name": "Barbell Squat",`  
        `"muscleGroup": "Legs",`  
        `"isCustom": false`  
    `},`  
    `{`  
        `"id": 7,`  
        `"name": "My Exercise",`  
        `"muscleGroup": "Shoulders",`  
        `"isCustom": true,`  
        `"userId": 1`  
    `}`  
`]`

`POST /api/exercises`  
`Authorization: Bearer {token}`  
`Content-Type: application/json`

`Request:`  
`{`  
    `"name": "Incline Dumbbell Press",`  
    `"muscleGroup": "Chest"`  
`}`

`Response (201):`  
`{`  
    `"id": 8,`  
    `"name": "Incline Dumbbell Press",`  
    `"muscleGroup": "Chest",`  
    `"isCustom": true,`  
    `"userId": 1`  
`}`

**3.4 Workout Management**

`POST /api/workouts`  
`Authorization: Bearer {token}`  
`Content-Type: application/json`

`Request:`  
`{`  
    `"date": "2025-08-31",`  
    `"startTime": "2025-08-31T15:00:00Z",`  
    `"endTime": "2025-08-31T16:30:00Z",`  
    `"notes": "Good workout",`  
    `"sets": [`  
        `{`  
            `"exerciseId": 1,`  
            `"setNumber": 1,`  
            `"weight": 80.0,`  
            `"reps": 10,`  
            `"restSeconds": 120`  
        `},`  
        `{`  
            `"exerciseId": 1,`  
            `"setNumber": 2,`  
            `"weight": 80.0,`  
            `"reps": 8,`  
            `"restSeconds": 120`  
        `}`  
    `]`  
`}`

`Response (201):`  
`{`  
    `"id": 15,`  
    `"date": "2025-08-31",`  
    `"startTime": "2025-08-31T15:00:00Z",`  
    `"endTime": "2025-08-31T16:30:00Z",`  
    `"notes": "Good workout",`  
    `"totalSets": 2,`  
    `"exercises": ["Barbell Squat"]`  
`}`

`GET /api/workouts`  
`Authorization: Bearer {token}`  
`Query params: ?page=0&size=10&fromDate=2025-08-01&toDate=2025-08-31`

`Response (200):`  
`{`  
    `"content": [`  
        `{`  
            `"id": 15,`  
            `"date": "2025-08-31",`  
            `"duration": "1h 30m",`  
            `"totalSets": 12,`  
            `"exercises": ["Barbell Squat", "Deadlift"],`  
            `"notes": "Good workout"`  
        `}`  
    `],`  
    `"totalElements": 25,`  
    `"totalPages": 3,`  
    `"number": 0,`  
    `"size": 10`  
`}`

`GET /api/workouts/{workoutId}/details`  
`Authorization: Bearer {token}`

`Response (200):`  
`{`  
    `"id": 15,`  
    `"date": "2025-08-31",`  
    `"startTime": "2025-08-31T15:00:00Z",`  
    `"endTime": "2025-08-31T16:30:00Z",`  
    `"notes": "Good workout",`  
    `"sets": [`  
        `{`  
            `"id": 100,`  
            `"exerciseName": "Barbell Squat",`  
            `"setNumber": 1,`  
            `"weight": 80.0,`  
            `"reps": 10,`  
            `"restSeconds": 120`  
        `},`  
        `{`  
            `"id": 101,`  
            `"exerciseName": "Barbell Squat",`  
            `"setNumber": 2,`  
            `"weight": 80.0,`  
            `"reps": 8,`  
            `"restSeconds": 120`  
        `}`  
    `]`  
`}`

**3.5 Personal Records**

`GET /api/personal-records`  
`Authorization: Bearer {token}`

`Response (200):`  
`[`  
    `{`  
        `"id": 5,`  
        `"exerciseName": "Barbell Squat",`  
        `"weight": 100.0,`  
        `"reps": 5,`  
        `"dateAchieved": "2025-08-25",`  
        `"workoutId": 12`  
    `},`  
    `{`  
        `"id": 6,`  
        `"exerciseName": "Deadlift",`  
        `"weight": 120.0,`  
        `"reps": 3,`  
        `"dateAchieved": "2025-08-30",`  
        `"workoutId": 14`  
    `}`  
`]`

**4\. Backend Architecture (Spring Boot)**

**4.1 Package Structure**

`src/main/java/com/treningi/app/`  
`├── config/`  
`│   ├── SecurityConfig.java`  
`│   ├── DatabaseConfig.java`  
`│   └── JwtConfig.java`  
`├── controller/`  
`│   ├── AuthController.java`  
`│   ├── UserController.java`  
`│   ├── ExerciseController.java`  
`│   ├── WorkoutController.java`  
`│   └── PersonalRecordController.java`  
`├── service/`  
`│   ├── AuthService.java`  
`│   ├── UserService.java`  
`│   ├── ExerciseService.java`  
`│   ├── WorkoutService.java`  
`│   └── PersonalRecordService.java`  
`├── repository/`  
`│   ├── UserRepository.java`  
`│   ├── ExerciseRepository.java`  
`│   ├── WorkoutRepository.java`  
`│   ├── WorkoutSetRepository.java`  
`│   └── PersonalRecordRepository.java`  
`├── entity/`  
`│   ├── User.java`  
`│   ├── Exercise.java`  
`│   ├── Workout.java`  
`│   ├── WorkoutSet.java`  
`│   └── PersonalRecord.java`  
`├── dto/`  
`│   ├── request/`  
`│   │   ├── LoginRequest.java`  
`│   │   ├── RegisterRequest.java`  
`│   │   ├── WorkoutRequest.java`  
`│   │   └── ExerciseRequest.java`  
`│   └── response/`  
`│       ├── AuthResponse.java`  
`│       ├── WorkoutResponse.java`  
`│       └── PersonalRecordResponse.java`  
`├── security/`  
`│   ├── JwtTokenProvider.java`  
`│   ├── JwtAuthenticationFilter.java`  
`│   └── UserPrincipal.java`  
`└── exception/`  
    `├── GlobalExceptionHandler.java`  
    `├── ResourceNotFoundException.java`  
    `└── UnauthorizedException.java`

**4.2 Sample Key Class Implementations**

**4.2.1 Entity Classes**

`@Entity`  
`@Table(name = "users")`  
`public class User {`  
    `@Id`  
    `@GeneratedValue(strategy = GenerationType.IDENTITY)`  
    `private Long id;`  
      
    `@Column(unique = true, nullable = false)`  
    `private String email;`  
      
    `@Column(nullable = false)`  
    `private String passwordHash;`  
      
    `@Column(nullable = false)`  
    `private String name;`  
      
    `@Column(precision = 5, scale = 2)`  
    `private BigDecimal weight;`  
      
    `private Integer height;`  
      
    `@CreationTimestamp`  
    `private LocalDateTime createdAt;`  
      
    `@UpdateTimestamp`  
    `private LocalDateTime updatedAt;`  
      
    `// getters, setters, constructors`  
`}`

`@Entity`  
`@Table(name = "workouts")`  
`public class Workout {`  
    `@Id`  
    `@GeneratedValue(strategy = GenerationType.IDENTITY)`  
    `private Long id;`  
      
    `@ManyToOne(fetch = FetchType.LAZY)`  
    `@JoinColumn(name = "user_id", nullable = false)`  
    `private User user;`  
      
    `@Column(nullable = false)`  
    `private LocalDate date;`  
      
    `private LocalDateTime startTime;`  
    `private LocalDateTime endTime;`  
    `private String notes;`  
      
    `@OneToMany(mappedBy = "workout", cascade = CascadeType.ALL, fetch = FetchType.LAZY)`  
    `private List<WorkoutSet> sets = new ArrayList<>();`  
      
    `@CreationTimestamp`  
    `private LocalDateTime createdAt;`  
      
    `// getters, setters, constructors`  
`}`

`@Entity`  
`@Table(name = "workout_sets")`  
`public class WorkoutSet {`  
    `@Id`  
    `@GeneratedValue(strategy = GenerationType.IDENTITY)`  
    `private Long id;`  
      
    `@ManyToOne(fetch = FetchType.LAZY)`  
    `@JoinColumn(name = "workout_id", nullable = false)`  
    `private Workout workout;`  
      
    `@ManyToOne(fetch = FetchType.LAZY)`  
    `@JoinColumn(name = "exercise_id", nullable = false)`  
    `private Exercise exercise;`  
      
    `@Column(nullable = false)`  
    `private Integer setNumber;`  
      
    `@Column(nullable = false, precision = 6, scale = 2)`  
    `private BigDecimal weight;`  
      
    `@Column(nullable = false)`  
    `private Integer reps;`  
      
    `private Integer restSeconds;`  
      
    `@CreationTimestamp`  
    `private LocalDateTime createdAt;`  
      
    `// getters, setters, constructors`  
`}`

**4.2.2 Repository Interfaces**

`@Repository`  
`public interface WorkoutRepository extends JpaRepository<Workout, Long> {`  
      
    `@Query("SELECT w FROM Workout w WHERE w.user.id = :userId ORDER BY w.date DESC")`  
    `Page<Workout> findByUserIdOrderByDateDesc(@Param("userId") Long userId, Pageable pageable);`  
      
    `@Query("SELECT w FROM Workout w WHERE w.user.id = :userId AND w.date BETWEEN :startDate AND :endDate ORDER BY w.date DESC")`  
    `List<Workout> findByUserIdAndDateBetween(@Param("userId") Long userId,`  
                                           `@Param("startDate") LocalDate startDate,`  
                                           `@Param("endDate") LocalDate endDate);`  
      
    `@Query("SELECT COUNT(w) FROM Workout w WHERE w.user.id = :userId")`  
    `Long countByUserId(@Param("userId") Long userId);`  
`}`

`@Repository`  
`public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Long> {`  
      
    `List<WorkoutSet> findByWorkoutIdOrderBySetNumber(Long workoutId);`  
      
    `@Query("SELECT ws FROM WorkoutSet ws WHERE ws.workout.user.id = :userId AND ws.exercise.id = :exerciseId ORDER BY ws.weight DESC, ws.reps DESC")`  
    `List<WorkoutSet> findBestSetsByUserAndExercise(@Param("userId") Long userId, @Param("exerciseId") Long exerciseId);`  
`}`

**4.2.3 Service Layer**

`@Service`  
`@Transactional`  
`public class WorkoutService {`  
      
    `private final WorkoutRepository workoutRepository;`  
    `private final WorkoutSetRepository workoutSetRepository;`  
    `private final PersonalRecordService personalRecordService;`  
      
    `public WorkoutResponse createWorkout(Long userId, WorkoutRequest request) {`  
        `Workout workout = new Workout();`  
        `workout.setUser(userRepository.getReferenceById(userId));`  
        `workout.setDate(request.getDate());`  
        `workout.setStartTime(request.getStartTime());`  
        `workout.setEndTime(request.getEndTime());`  
        `workout.setNotes(request.getNotes());`  
          
        `Workout savedWorkout = workoutRepository.save(workout);`  
          
        `// Save sets`  
        `List<WorkoutSet> sets = request.getSets().stream()`  
            `.map(setRequest -> {`  
                `WorkoutSet set = new WorkoutSet();`  
                `set.setWorkout(savedWorkout);`  
                `set.setExercise(exerciseRepository.getReferenceById(setRequest.getExerciseId()));`  
                `set.setSetNumber(setRequest.getSetNumber());`  
                `set.setWeight(setRequest.getWeight());`  
                `set.setReps(setRequest.getReps());`  
                `set.setRestSeconds(setRequest.getRestSeconds());`  
                `return set;`  
            `})`  
            `.collect(Collectors.toList());`  
          
        `workoutSetRepository.saveAll(sets);`  
          
        `// Check and update personal records`  
        `personalRecordService.updatePersonalRecords(userId, sets);`  
          
        `return mapToWorkoutResponse(savedWorkout);`  
    `}`  
      
    `@Transactional(readOnly = true)`  
    `public Page<WorkoutSummaryResponse> getUserWorkouts(Long userId, Pageable pageable) {`  
        `return workoutRepository.findByUserIdOrderByDateDesc(userId, pageable)`  
            `.map(this::mapToWorkoutSummaryResponse);`  
    `}`  
`}`

**4.2.4 Controller Layer**

`@RestController`  
`@RequestMapping("/api/workouts")`  
`@CrossOrigin(origins = "http://localhost:3000")`  
`public class WorkoutController {`  
      
    `private final WorkoutService workoutService;`  
      
    `@PostMapping`  
    `public ResponseEntity<WorkoutResponse> createWorkout(`  
        `@RequestBody @Valid WorkoutRequest request,`  
        `Authentication authentication) {`  
          
        `Long userId = getUserIdFromAuth(authentication);`  
        `WorkoutResponse response = workoutService.createWorkout(userId, request);`  
        `return ResponseEntity.status(HttpStatus.CREATED).body(response);`  
    `}`  
      
    `@GetMapping`  
    `public ResponseEntity<Page<WorkoutSummaryResponse>> getWorkouts(`  
        `@RequestParam(defaultValue = "0") int page,`  
        `@RequestParam(defaultValue = "10") int size,`  
        `@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,`  
        `@RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,`  
        `Authentication authentication) {`  
          
        `Long userId = getUserIdFromAuth(authentication);`  
        `Pageable pageable = PageRequest.of(page, size);`  
          
        `Page<WorkoutSummaryResponse> workouts = workoutService.getUserWorkouts(userId, pageable);`  
        `return ResponseEntity.ok(workouts);`  
    `}`  
      
    `@GetMapping("/{workoutId}/details")`  
    `public ResponseEntity<WorkoutDetailResponse> getWorkoutDetails(`  
        `@PathVariable Long workoutId,`  
        `Authentication authentication) {`  
          
        `Long userId = getUserIdFromAuth(authentication);`  
        `WorkoutDetailResponse response = workoutService.getWorkoutDetails(workoutId, userId);`  
        `return ResponseEntity.ok(response);`  
    `}`  
`}`

**4.3 Security Configuration**

`@Configuration`  
`@EnableWebSecurity`  
`@EnableMethodSecurity`  
`public class SecurityConfig {`  
      
    `private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;`  
    `private final JwtAuthenticationFilter jwtAuthenticationFilter;`  
      
    `@Bean`  
    `public PasswordEncoder passwordEncoder() {`  
        `return new BCryptPasswordEncoder(12);`  
    `}`  
      
    `@Bean`  
    `public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {`  
        `http.csrf(csrf -> csrf.disable())`  
            `.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))`  
            `.authorizeHttpRequests(authz -> authz`  
                `.requestMatchers("/api/auth/**").permitAll()`  
                `.requestMatchers("/api/health").permitAll()`  
                `.anyRequest().authenticated()`  
            `)`  
            `.exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))`  
            `.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);`  
          
        `return http.build();`  
    `}`  
`}`

**5\. Frontend Architecture (React)**

**5.1 Folder Structure**

`src/`  
`├── components/`  
`│   ├── common/`  
`│   │   ├── Header.jsx`  
`│   │   ├── Footer.jsx`  
`│   │   ├── Loading.jsx`  
`│   │   └── ErrorMessage.jsx`  
`│   ├── auth/`  
`│   │   ├── LoginForm.jsx`  
`│   │   ├── RegisterForm.jsx`  
`│   │   └── ProtectedRoute.jsx`  
`│   ├── workout/`  
`│   │   ├── WorkoutForm.jsx`  
`│   │   ├── WorkoutList.jsx`  
`│   │   ├── WorkoutDetail.jsx`  
`│   │   ├── ExerciseSelector.jsx`  
`│   │   └── SetInput.jsx`  
`│   └── dashboard/`  
`│       ├── Dashboard.jsx`  
`│       ├── PersonalRecords.jsx`  
`│       └── ProgressChart.jsx`  
`├── hooks/`  
`│   ├── useAuth.js`  
`│   ├── useApi.js`  
`│   └── useLocalStorage.js`  
`├── services/`  
`│   ├── api.js`  
`│   ├── authService.js`  
`│   └── workoutService.js`  
`├── context/`  
`│   └── AuthContext.jsx`  
`├── utils/`  
`│   ├── constants.js`  
`│   ├── formatters.js`  
`│   └── validators.js`  
`├── pages/`  
`│   ├── LoginPage.jsx`  
`│   ├── RegisterPage.jsx`  
`│   ├── DashboardPage.jsx`  
`│   ├── WorkoutPage.jsx`  
`│   └── HistoryPage.jsx`  
`└── App.jsx`

**5.2 Main React Components**

**5.2.1 App Component and Routing**

`import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';`  
`import { AuthProvider } from './context/AuthContext';`  
`import ProtectedRoute from './components/auth/ProtectedRoute';`

`function App() {`  
    `return (`  
        `<AuthProvider>`  
            `<Router>`  
                `<div className="App">`  
                    `<Routes>`  
                        `<Route path="/login" element={<LoginPage />} />`  
                        `<Route path="/register" element={<RegisterPage />} />`  
                        `<Route path="/" element={`  
                            `<ProtectedRoute>`  
                                `<DashboardPage />`  
                            `</ProtectedRoute>`  
                        `} />`  
                        `<Route path="/workout" element={`  
                            `<ProtectedRoute>`  
                                `<WorkoutPage />`  
                            `</ProtectedRoute>`  
                        `} />`  
                        `<Route path="/history" element={`  
                            `<ProtectedRoute>`  
                                `<HistoryPage />`  
                            `</ProtectedRoute>`  
                        `} />`  
                        `<Route path="*" element={<Navigate to="/" replace />} />`  
                    `</Routes>`  
                `</div>`  
            `</Router>`  
        `</AuthProvider>`  
    `);`  
`}`

**5.2.2 Workout Form Component**

`import React, { useState, useEffect } from 'react';`  
`import { useApi } from '../hooks/useApi';`

`const WorkoutForm = () => {`  
    `const [workout, setWorkout] = useState({`  
        `date: new Date().toISOString().split('T')[^0],`  
        `startTime: new Date().toISOString(),`  
        `endTime: '',`  
        `notes: '',`  
        `sets: []`  
    `});`

    `const [exercises, setExercises] = useState([]);`  
    `const [selectedExercise, setSelectedExercise] = useState('');`  
    `const { apiCall, loading, error } = useApi();`

    `useEffect(() => {`  
        `loadExercises();`  
    `}, []);`

    `const loadExercises = async () => {`  
        `try {`  
            `const data = await apiCall('/api/exercises', 'GET');`  
            `setExercises(data);`  
        `} catch (err) {`  
            `console.error('Error loading exercises:', err);`  
        `}`  
    `};`

    `const addSet = () => {`  
        `if (!selectedExercise) return;`

        `const setNumber = workout.sets.filter(s => s.exerciseId === parseInt(selectedExercise)).length + 1;`

        `const newSet = {`  
            `exerciseId: parseInt(selectedExercise),`  
            `exerciseName: exercises.find(e => e.id === parseInt(selectedExercise))?.name,`  
            `setNumber,`  
            `weight: '',`  
            `reps: '',`  
            `restSeconds: 120`  
        `};`

        `setWorkout(prev => ({`  
            `...prev,`  
            `sets: [...prev.sets, newSet]`  
        `}));`  
    `};`

    `const updateSet = (index, field, value) => {`  
        `setWorkout(prev => ({`  
            `...prev,`  
            `sets: prev.sets.map((set, i) =>`  
                `i === index ? { ...set, [field]: value } : set`  
            `)`  
        `}));`  
    `};`

    `const removeSet = (index) => {`  
        `setWorkout(prev => ({`  
            `...prev,`  
            `sets: prev.sets.filter((_, i) => i !== index)`  
        `}));`  
    `};`

    `const saveWorkout = async () => {`  
        `try {`  
            `const workoutData = {`  
                `...workout,`  
                `endTime: new Date().toISOString(),`  
                `sets: workout.sets.map(set => ({`  
                    `exerciseId: set.exerciseId,`  
                    `setNumber: set.setNumber,`  
                    `weight: parseFloat(set.weight),`  
                    `reps: parseInt(set.reps),`  
                    `restSeconds: set.restSeconds`  
                `}))`  
            `};`

            `await apiCall('/api/workouts', 'POST', workoutData);`  
            `alert('Workout saved successfully!');`

            `// Reset form`  
            `setWorkout({`  
                `date: new Date().toISOString().split('T')[^0],`  
                `startTime: new Date().toISOString(),`  
                `endTime: '',`  
                `notes: '',`  
                `sets: []`  
            `});`  
        `} catch (err) {`  
            `console.error('Error saving workout:', err);`  
        `}`  
    `};`

    `return (`  
        `<div className="workout-form">`  
            `<div className="workout-header">`  
                `<h2>New Workout</h2>`  
                `<input`  
                    `type="date"`  
                    `value={workout.date}`  
                    `onChange={(e) => setWorkout(prev => ({...prev, date: e.target.value}))}`  
                `/>`  
            `</div>`

            `<div className="exercise-selector">`  
                `<select`  
                    `value={selectedExercise}`  
                    `onChange={(e) => setSelectedExercise(e.target.value)}`  
                `>`  
                    `<option value="">Select exercise</option>`  
                    `{exercises.map(exercise => (`  
                        `<option key={exercise.id} value={exercise.id}>`  
                            `{exercise.name}`  
                        `</option>`  
                    `))}`  
                `</select>`  
                `<button onClick={addSet} disabled={!selectedExercise}>`  
                    `Add Set`  
                `</button>`  
            `</div>`

            `<div className="sets-list">`  
                `{workout.sets.map((set, index) => (`  
                    `<div key={index} className="set-row">`  
                        `<span className="exercise-name">{set.exerciseName}</span>`  
                        `<span className="set-number">Set {set.setNumber}</span>`  
                        `<input`  
                            `type="number"`  
                            `placeholder="Weight (kg)"`  
                            `value={set.weight}`  
                            `onChange={(e) => updateSet(index, 'weight', e.target.value)}`  
                            `step="0.5"`  
                        `/>`  
                        `<input`  
                            `type="number"`  
                            `placeholder="Reps"`  
                            `value={set.reps}`  
                            `onChange={(e) => updateSet(index, 'reps', e.target.value)}`  
                            `min="1"`  
                        `/>`  
                        `<input`  
                            `type="number"`  
                            `placeholder="Rest (s)"`  
                            `value={set.restSeconds}`  
                            `onChange={(e) => updateSet(index, 'restSeconds', e.target.value)}`  
                        `/>`  
                        `<button onClick={() => removeSet(index)} className="remove-btn">`  
                            `Remove`  
                        `</button>`  
                    `</div>`  
                `))}`  
            `</div>`

            `<div className="workout-notes">`  
                `<textarea`  
                    `placeholder="Workout notes..."`  
                    `value={workout.notes}`  
                    `onChange={(e) => setWorkout(prev => ({...prev, notes: e.target.value}))}`  
                    `rows="3"`  
                `/>`  
            `</div>`

            `<button`  
                `onClick={saveWorkout}`  
                `disabled={loading || workout.sets.length === 0}`  
                `className="save-btn"`  
            `>`  
                `{loading ? 'Saving...' : 'Save Workout'}`  
            `</button>`

            `{error && <div className="error-message">{error}</div>}`  
        `</div>`  
    `);`  
`};`

**5.2.3 Custom Hooks**

`// useApi.js`  
`import { useState } from 'react';`  
`import { useAuth } from '../context/AuthContext';`

`export const useApi = () => {`  
    `const [loading, setLoading] = useState(false);`  
    `const [error, setError] = useState(null);`  
    `const { token, logout } = useAuth();`

    `const apiCall = async (endpoint, method = 'GET', data = null) => {`  
        `setLoading(true);`  
        `setError(null);`

        `try {`  
            `const config = {`  
                `method,`  
                `headers: {`  
                    `'Content-Type': 'application/json',`  
                    ``...(token && { 'Authorization': `Bearer ${token}` })``  
                `},`  
                `...(data && { body: JSON.stringify(data) })`  
            `};`

            ``const response = await fetch(`${process.env.REACT_APP_API_URL}${endpoint}`, config);``

            `if (response.status === 401) {`  
                `logout();`  
                `throw new Error('Session expired');`  
            `}`

            `if (!response.ok) {`  
                `const errorData = await response.json();`  
                `throw new Error(errorData.message || 'An error occurred');`  
            `}`

            `return await response.json();`  
        `} catch (err) {`  
            `setError(err.message);`  
            `throw err;`  
        `} finally {`  
            `setLoading(false);`  
        `}`  
    `};`

    `return { apiCall, loading, error };`  
`};`

**5.3 State Management Context**

`// AuthContext.jsx`  
`import React, { createContext, useContext, useState, useEffect } from 'react';`

`const AuthContext = createContext();`

`export const useAuth = () => {`  
    `const context = useContext(AuthContext);`  
    `if (!context) {`  
        `throw new Error('useAuth must be used within AuthProvider');`  
    `}`  
    `return context;`  
`};`

`export const AuthProvider = ({ children }) => {`  
    `const [user, setUser] = useState(null);`  
    `const [token, setToken] = useState(localStorage.getItem('token'));`  
    `const [loading, setLoading] = useState(true);`

    `useEffect(() => {`  
        `if (token) {`  
            `// Validate token and load user data`  
            `validateToken();`  
        `} else {`  
            `setLoading(false);`  
        `}`  
    `}, [token]);`

    `const validateToken = async () => {`  
        `try {`  
            ``const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/profile`, {``  
                `headers: {`  
                    `` 'Authorization': `Bearer ${token}` ``  
                `}`  
            `});`

            `if (response.ok) {`  
                `const userData = await response.json();`  
                `setUser(userData);`  
            `} else {`  
                `logout();`  
            `}`  
        `} catch (error) {`  
            `logout();`  
        `} finally {`  
            `setLoading(false);`  
        `}`  
    `};`

    `const login = (userData, authToken) => {`  
        `setUser(userData);`  
        `setToken(authToken);`  
        `localStorage.setItem('token', authToken);`  
    `};`

    `const logout = () => {`  
        `setUser(null);`  
        `setToken(null);`  
        `localStorage.removeItem('token');`  
    `};`

    `const value = {`  
        `user,`  
        `token,`  
        `loading,`  
        `login,`  
        `logout,`  
        `isAuthenticated: !!user`  
    `};`

    `return (`  
        `<AuthContext.Provider value={value}>`  
            `{children}`  
        `</AuthContext.Provider>`  
    `);`  
`};`

**6\. Deployment Configuration on Raspberry Pi**

**6.1 Docker Compose Configuration**

`# docker-compose.yml`  
`version: '3.8'`

`services:`  
  `postgres:`  
    `image: postgres:15-alpine`  
    `container_name: treningi_db`  
    `environment:`  
      `POSTGRES_DB: treningi`  
      `POSTGRES_USER: treningi_user`  
      `POSTGRES_PASSWORD: secure_password_123`  
    `volumes:`  
      `- postgres_data:/var/lib/postgresql/data`  
      `- ./init.sql:/docker-entrypoint-initdb.d/init.sql`  
    `ports:`  
      `- "5432:5432"`  
    `restart: unless-stopped`

  `backend:`  
    `build: ./backend`  
    `container_name: treningi_backend`  
    `environment:`  
      `SPRING_PROFILES_ACTIVE: production`  
      `DATABASE_URL: jdbc:postgresql://postgres:5432/treningi`  
      `DATABASE_USERNAME: treningi_user`  
      `DATABASE_PASSWORD: secure_password_123`  
      `JWT_SECRET: your_super_secret_jwt_key_here_min_256_bits`  
    `ports:`  
      `- "8080:8080"`  
    `depends_on:`  
      `- postgres`  
    `restart: unless-stopped`

  `frontend:`  
    `build: ./frontend`  
    `container_name: treningi_frontend`  
    `environment:`  
      `REACT_APP_API_URL: http://localhost:8080`  
    `ports:`  
      `- "80:80"`  
    `depends_on:`  
      `- backend`  
    `restart: unless-stopped`

`volumes:`  
  `postgres_data:`

**6.2 Backend Dockerfile**

`# backend/Dockerfile`  
`FROM openjdk:17-jdk-slim`

`WORKDIR /app`

`# Copy Maven files`  
`COPY pom.xml .`  
`COPY src ./src`

`# Install Maven and build application`  
`RUN apt-get update && apt-get install -y maven && \`  
    `mvn clean package -DskipTests && \`  
    `apt-get remove -y maven && \`  
    `apt-get autoremove -y && \`  
    `rm -rf /var/lib/apt/lists/*`

`# Optimization for Raspberry Pi`  
`ENV JAVA_OPTS="-Xmx256m -Xms128m -XX:+UseG1GC"`

`EXPOSE 8080`

`CMD ["java", "-jar", "target/treningi-app-1.0.0.jar"]`

**6.3 Frontend Dockerfile**

`# frontend/Dockerfile`  
`FROM node:18-alpine as builder`

`WORKDIR /app`  
`COPY package*.json ./`  
`RUN npm ci --only=production`

`COPY . .`  
`RUN npm run build`

`FROM nginx:alpine`  
`COPY --from=builder /app/build /usr/share/nginx/html`  
`COPY nginx.conf /etc/nginx/nginx.conf`

`EXPOSE 80`  
`CMD ["nginx", "-g", "daemon off;"]`

**6.4 Nginx Configuration**

`# nginx.conf`  
`events {`  
    `worker_connections 1024;`  
`}`

`http {`  
    `include /etc/nginx/mime.types;`  
    `default_type application/octet-stream;`

    `sendfile on;`  
    `keepalive_timeout 65;`

    `# Optimization for Raspberry Pi`  
    `worker_processes 1;`

    `server {`  
        `listen 80;`  
        `server_name localhost;`  
        `root /usr/share/nginx/html;`  
        `index index.html;`

        `# React Router - redirect all paths to index.html`  
        `location / {`  
            `try_files $uri $uri/ /index.html;`  
        `}`

        `# Proxy API calls to backend`  
        `location /api/ {`  
            `proxy_pass http://backend:8080;`  
            `proxy_set_header Host $host;`  
            `proxy_set_header X-Real-IP $remote_addr;`  
            `proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`  
            `proxy_set_header X-Forwarded-Proto $scheme;`  
        `}`

        `# Cache static files`  
        `location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {`  
            `expires 1y;`  
            `add_header Cache-Control "public, immutable";`  
        `}`  
    `}`  
`}`

**7\. Performance Optimizations for Raspberry Pi**

**7.1 Backend (Spring Boot)**

`# application-production.yml`  
`server:`  
  `port: 8080`  
  `tomcat:`  
    `max-threads: 20`  
    `min-spare-threads: 2`  
    `max-connections: 100`

`spring:`  
  `jpa:`  
    `hibernate:`  
      `ddl-auto: validate`  
      `show-sql: false`  
      `properties:`  
        `hibernate:`  
          `jdbc:`  
            `batch_size: 20`  
          `connection:`  
            `provider_disables_autocommit: true`  
          `cache:`  
            `use_second_level_cache: false`

  `datasource:`  
    `hikari:`  
      `maximum-pool-size: 5`  
      `minimum-idle: 2`  
      `connection-timeout: 30000`  
      `idle-timeout: 600000`  
      `max-lifetime: 1800000`

`logging:`  
  `level:`  
    `com.treningi.app: INFO`  
    `org.springframework: WARN`  
    `org.hibernate: WARN`

**7.2 Frontend Optimizations**

`// package.json - optimized build`  
`{`  
    `"scripts": {`  
        `"build": "GENERATE_SOURCEMAP=false npm run build && npm run optimize",`  
        `"optimize": "npx terser build/static/js/*.js --compress --mangle --output-dir build/static/js/"`  
    `}`  
`}`

**7.3 Database Optimizations**

`-- PostgreSQL configuration for limited resources`  
`-- postgresql.conf adjustments`  
`shared_buffers = 32MB`  
`effective_cache_size = 128MB`  
`maintenance_work_mem = 16MB`  
`work_mem = 2MB`  
`max_connections = 20`

**8\. Monitoring and Health Checks**

**8.1 Health Check Endpoint**

`@RestController`  
`@RequestMapping("/api/health")`  
`public class HealthController {`

    `@Autowired`  
    `private DataSource dataSource;`

    `@GetMapping`  
    `public ResponseEntity<Map<String, Object>> health() {`  
        `Map<String, Object> health = new HashMap<>();`  
        `health.put("status", "UP");`  
        `health.put("timestamp", LocalDateTime.now());`

        `// Check database connectivity`  
        `try {`  
            `dataSource.getConnection().close();`  
            `health.put("database", "UP");`  
        `} catch (Exception e) {`  
            `health.put("database", "DOWN");`  
            `health.put("status", "DOWN");`  
        `}`

        `// Memory usage`  
        `Runtime runtime = Runtime.getRuntime();`  
        `health.put("memory", Map.of(`  
            `"used", runtime.totalMemory() - runtime.freeMemory(),`  
            `"total", runtime.totalMemory(),`  
            `"max", runtime.maxMemory()`  
        `));`

        `HttpStatus status = "UP".equals(health.get("status")) ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;`  
        `return ResponseEntity.status(status).body(health);`  
    `}`  
`}`

**8.2 Basic Monitoring Script**

`#!/bin/bash`  
`# monitor.sh - Basic monitoring for Raspberry Pi`

`while true; do`  
    `# Check if containers are running`  
    `docker-compose ps | grep -q "Up" || {`  
        `echo "$(date): Containers down, restarting..."`  
        `docker-compose up -d`  
    `}`

    `# Check memory usage`  
    `memory_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')`  
    `if [ $memory_usage -gt 90 ]; then`  
        `echo "$(date): High memory usage: ${memory_usage}%"`  
    `fi`

    `# Check disk space`  
    `disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')`  
    `if [ $disk_usage -gt 85 ]; then`  
        `echo "$(date): High disk usage: ${disk_usage}%"`  
    `fi`

    `sleep 300 # Check every 5 minutes`  
`done`

**9\. Deployment Procedures**

**9.1 Initial Setup on Raspberry Pi**

`# Install Docker and Docker Compose`  
`curl -fsSL https://get.docker.com -o get-docker.sh`  
`sudo sh get-docker.sh`  
`sudo usermod -aG docker pi`

`# Clone repository`  
`git clone https://github.com/yourusername/treningi-app.git`  
`cd treningi-app`

`# Set environment variables`  
`cp .env.example .env`  
`# Edit .env with proper values`

`# First run`  
`docker-compose up -d`

`# Check status`  
`docker-compose ps`  
`curl http://localhost/api/health`

**9.2 Update Procedure**

`#!/bin/bash`  
`# update.sh - Zero-downtime update`

`# Pull latest changes`  
`git pull origin main`

`# Build new images`  
`docker-compose build`

`# Rolling update`  
`docker-compose up -d --no-deps backend`  
`sleep 30`  
`docker-compose up -d --no-deps frontend`

`# Cleanup old images`  
`docker image prune -f`

**10\. Testing Strategy for Automated Testing Framework**

**10.1 Backend Testing Endpoints**

`// Additional endpoints for automated testing`  
`@RestController`  
`@RequestMapping("/api/test")`  
`@Profile("test")`  
`public class TestController {`

    `@PostMapping("/reset-data")`  
    `public ResponseEntity<Void> resetTestData() {`  
        `// Clear all test data`  
        `return ResponseEntity.ok().build();`  
    `}`

    `@PostMapping("/seed-data")`  
    `public ResponseEntity<Void> seedTestData(@RequestBody TestDataRequest request) {`  
        `// Create test data according to request`  
        `return ResponseEntity.ok().build();`  
    `}`

    `@GetMapping("/database-state")`  
    `public ResponseEntity<Map<String, Integer>> getDatabaseState() {`  
        `// Return record counts in each table`  
        `return ResponseEntity.ok(Map.of(`  
            `"users", userRepository.count(),`  
            `"workouts", workoutRepository.count(),`  
            `"sets", workoutSetRepository.count()`  
        `));`  
    `}`  
`}`

**10.2 Frontend Testing Hooks**

`// testUtils.jsx - Utilities for GUI tests`  
`export const TestUtils = {`

    `// Automatic workout form filling`  
    `fillWorkoutForm: (workout) => {`  
        `cy.get('[data-testid="workout-date"]').clear().type(workout.date);`  
        `cy.get('[data-testid="exercise-select"]').select(workout.exercise);`

        `workout.sets.forEach((set, index) => {`  
            `cy.get('[data-testid="add-set-btn"]').click();`  
            ``cy.get(`[data-testid="set-${index}-weight"]`).type(set.weight);``  
            ``cy.get(`[data-testid="set-${index}-reps"]`).type(set.reps);``  
        `});`

        `if (workout.notes) {`  
            `cy.get('[data-testid="workout-notes"]').type(workout.notes);`  
        `}`  
    `},`

    `// Data verification`  
    `verifyWorkoutInHistory: (workout) => {`  
        `cy.get('[data-testid="workout-history"]')`  
            `.should('contain', workout.date)`  
            `.should('contain', workout.exercise);`  
    `}`  
`};`

**10.3 Test Data Attributes**

`// Components with data-testid attributes for automated testing`  
`const WorkoutForm = () => {`  
    `return (`  
        `<form data-testid="workout-form">`  
            `<input`  
                `data-testid="workout-date"`  
                `type="date"`  
                `value={workout.date}`  
                `onChange={handleDateChange}`  
            `/>`

            `<select data-testid="exercise-select" onChange={handleExerciseSelect}>`  
                `{exercises.map(exercise => (`  
                    `<option key={exercise.id} value={exercise.id}>`  
                        `{exercise.name}`  
                    `</option>`  
                `))}`  
            `</select>`

            `<button data-testid="add-set-btn" onClick={addSet}>`  
                `Add Set`  
            `</button>`

            `{workout.sets.map((set, index) => (`  
                ``<div key={index} data-testid={`set-${index}`}>``  
                    `<input`  
                        ``data-testid={`set-${index}-weight`}``  
                        `type="number"`  
                        `value={set.weight}`  
                        `onChange={(e) => updateSet(index, 'weight', e.target.value)}`  
                    `/>`  
                    `<input`  
                        ``data-testid={`set-${index}-reps`}``  
                        `type="number"`  
                        `value={set.reps}`  
                        `onChange={(e) => updateSet(index, 'reps', e.target.value)}`  
                    `/>`  
                `</div>`  
            `))}`

            `<button data-testid="save-workout-btn" onClick={saveWorkout}>`  
                `Save Workout`  
            `</button>`  
        `</form>`  
    `);`  
`};`

**11\. Error Handling and Validation**

**11.1 Backend Validation**

`// DTO with validation`  
`public class WorkoutRequest {`

    `@NotNull(message = "Workout date is required")`  
    `private LocalDate date;`

    `@NotNull(message = "Start time is required")`  
    `private LocalDateTime startTime;`

    `@Size(max = 500, message = "Notes cannot exceed 500 characters")`  
    `private String notes;`

    `@NotEmpty(message = "Workout must contain at least one set")`  
    `@Valid`  
    `private List<WorkoutSetRequest> sets;`  
`}`

`public class WorkoutSetRequest {`

    `@NotNull(message = "Exercise ID is required")`  
    `private Long exerciseId;`

    `@Min(value = 1, message = "Set number must be greater than 0")`  
    `private Integer setNumber;`

    `@DecimalMin(value = "0.5", message = "Weight must be greater than 0.5 kg")`  
    `@DecimalMax(value = "999.99", message = "Weight cannot exceed 999.99 kg")`  
    `private BigDecimal weight;`

    `@Min(value = 1, message = "Reps must be greater than 0")`  
    `@Max(value = 999, message = "Reps cannot exceed 999")`  
    `private Integer reps;`  
`}`

**11.2 Global Exception Handler**

`@ControllerAdvice`  
`public class GlobalExceptionHandler {`

    `@ExceptionHandler(MethodArgumentNotValidException.class)`  
    `public ResponseEntity<ErrorResponse> handleValidationExceptions(`  
        `MethodArgumentNotValidException ex) {`

        `Map<String, String> errors = new HashMap<>();`  
        `ex.getBindingResult().getAllErrors().forEach((error) -> {`  
            `String fieldName = ((FieldError) error).getField();`  
            `String errorMessage = error.getDefaultMessage();`  
            `errors.put(fieldName, errorMessage);`  
        `});`

        `ErrorResponse errorResponse = new ErrorResponse(`  
            `"Validation error",`  
            `HttpStatus.BAD_REQUEST.value(),`  
            `errors`  
        `);`

        `return ResponseEntity.badRequest().body(errorResponse);`  
    `}`

    `@ExceptionHandler(ResourceNotFoundException.class)`  
    `public ResponseEntity<ErrorResponse> handleResourceNotFound(`  
        `ResourceNotFoundException ex) {`

        `ErrorResponse errorResponse = new ErrorResponse(`  
            `ex.getMessage(),`  
            `HttpStatus.NOT_FOUND.value(),`  
            `null`  
        `);`

        `return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);`  
    `}`  
`}`

**12\. Performance Considerations**

**12.1 Database Query Optimization**

`// Example of query optimization`  
`@Repository`  
`public interface WorkoutRepository extends JpaRepository<Workout, Long> {`

    `// Query with join fetch to avoid N+1 problem`  
    `@Query("SELECT w FROM Workout w " +`  
           `"LEFT JOIN FETCH w.sets s " +`  
           `"LEFT JOIN FETCH s.exercise e " +`  
           `"WHERE w.user.id = :userId AND w.id = :workoutId")`  
    `Optional<Workout> findWorkoutWithSetsAndExercises(@Param("userId") Long userId,`  
                                                     `@Param("workoutId") Long workoutId);`

    `// Projection for workout list (without loading all sets)`  
    `@Query("SELECT new com.treningi.app.dto.WorkoutSummaryDTO(" +`  
           `"w.id, w.date, w.startTime, w.endTime, w.notes, " +`  
           `"COUNT(s.id), " +`  
           `"STRING_AGG(DISTINCT e.name, ', ')) " +`  
           `"FROM Workout w " +`  
           `"LEFT JOIN w.sets s " +`  
           `"LEFT JOIN s.exercise e " +`  
           `"WHERE w.user.id = :userId " +`  
           `"GROUP BY w.id, w.date, w.startTime, w.endTime, w.notes " +`  
           `"ORDER BY w.date DESC")`  
    `Page<WorkoutSummaryDTO> findWorkoutSummariesByUserId(@Param("userId") Long userId, Pageable pageable);`  
`}`

**12.2 Frontend Optimizations**

`// Lazy loading for components`  
`import { lazy, Suspense } from 'react';`

`const WorkoutPage = lazy(() => import('./pages/WorkoutPage'));`  
`const HistoryPage = lazy(() => import('./pages/HistoryPage'));`

`// Memoization for performance`  
`import { memo, useMemo, useCallback } from 'react';`

`const WorkoutList = memo(({ workouts, onWorkoutSelect }) => {`  
    `const sortedWorkouts = useMemo(() =>`  
        `workouts.sort((a, b) => new Date(b.date) - new Date(a.date)),`  
        `[workouts]`  
    `);`

    `const handleSelect = useCallback((workoutId) => {`  
        `onWorkoutSelect(workoutId);`  
    `}, [onWorkoutSelect]);`

    `return (`  
        `<div>`  
            `{sortedWorkouts.map(workout => (`  
                `<WorkoutItem`  
                    `key={workout.id}`  
                    `workout={workout}`  
                    `onSelect={handleSelect}`  
                `/>`  
            `))}`  
        `</div>`  
    `);`  
`});`

**13\. Security Implementation**

**13.1 JWT Token Provider**

`@Component`  
`public class JwtTokenProvider {`

    `private static final String JWT_SECRET = "your_super_secret_jwt_key_here_min_256_bits";`  
    `private static final int JWT_EXPIRATION = 604800000; // 7 days`

    `public String generateToken(UserPrincipal userPrincipal) {`  
        `Date expiryDate = new Date(System.currentTimeMillis() + JWT_EXPIRATION);`

        `return Jwts.builder()`  
            `.setSubject(Long.toString(userPrincipal.getId()))`  
            `.setIssuedAt(new Date())`  
            `.setExpiration(expiryDate)`  
            `.signWith(SignatureAlgorithm.HS512, JWT_SECRET)`  
            `.compact();`  
    `}`

    `public Long getUserIdFromJWT(String token) {`  
        `Claims claims = Jwts.parser()`  
            `.setSigningKey(JWT_SECRET)`  
            `.parseClaimsJws(token)`  
            `.getBody();`

        `return Long.parseLong(claims.getSubject());`  
    `}`

    `public boolean validateToken(String authToken) {`  
        `try {`  
            `Jwts.parser().setSigningKey(JWT_SECRET).parseClaimsJws(authToken);`  
            `return true;`  
        `} catch (SignatureException | MalformedJwtException | ExpiredJwtException | UnsupportedJwtException | IllegalArgumentException ex) {`  
            `return false;`  
        `}`  
    `}`  
`}`

**13.2 Password Security**

`@Service`  
`public class AuthService {`

    `private final PasswordEncoder passwordEncoder;`  
    `private final UserRepository userRepository;`  
    `private final JwtTokenProvider tokenProvider;`

    `public AuthResponse authenticateUser(LoginRequest loginRequest) {`  
        `Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());`

        `if (userOptional.isEmpty()) {`  
            `throw new BadCredentialsException("Invalid login credentials");`  
        `}`

        `User user = userOptional.get();`

        `if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {`  
            `throw new BadCredentialsException("Invalid login credentials");`  
        `}`

        `UserPrincipal userPrincipal = UserPrincipal.create(user);`  
        `String jwt = tokenProvider.generateToken(userPrincipal);`

        `return new AuthResponse(user.getId(), user.getEmail(), user.getName(), jwt);`  
    `}`  
`}`

**14\. Startup and Deployment Procedures**

**14.1 Automatic Startup on System Boot**

`# /etc/systemd/system/treningi-app.service`  
`[Unit]`  
`Description=Treningi App`  
`Requires=docker.service`  
`After=docker.service`

`[Service]`  
`Type=oneshot`  
`RemainAfterExit=yes`  
`WorkingDirectory=/home/pi/treningi-app`  
`ExecStart=/usr/local/bin/docker-compose up -d`  
`ExecStop=/usr/local/bin/docker-compose down`  
`TimeoutStartSec=0`

`[Install]`  
`WantedBy=multi-user.target`

**14.2 Backup Strategy**

`#!/bin/bash`  
`# backup.sh - Database backup script`

`BACKUP_DIR="/home/pi/backups"`  
`TIMESTAMP=$(date +"%Y%m%d_%H%M%S")`  
`BACKUP_FILE="treningi_backup_${TIMESTAMP}.sql"`

`# Create backup directory if it doesn't exist`  
`mkdir -p $BACKUP_DIR`

`# Create database backup`  
`docker exec treningi_db pg_dump -U treningi_user treningi > "${BACKUP_DIR}/${BACKUP_FILE}"`

`# Compress backup`  
`gzip "${BACKUP_DIR}/${BACKUP_FILE}"`

`# Keep only last 7 backups`  
`find $BACKUP_DIR -name "treningi_backup_*.sql.gz" -mtime +7 -delete`

`echo "Backup created: ${BACKUP_FILE}.gz"`

**15\. Summary and Next Steps**

**15.1 MVP Checklist**

* \[ \] Implementation of all entities and repositories

* \[ \] Basic API endpoints (auth, workouts, exercises)

* \[ \] React components (login, workout form, history)

* \[ \] JWT authentication flow

* \[ \] Docker containerization

* \[ \] Deployment on Raspberry Pi

* \[ \] Basic monitoring and health checks

**15.2 Preparation for Testing**

* \[ \] Test data attributes in React components

* \[ \] Test endpoints in backend

* \[ \] Seeding/reset mechanisms for test data

* \[ \] Health check endpoint for application state verification

**15.3 Potential Extensions (Beyond MVP)**

* Workout planning and templates

* Data export to CSV/PDF

* Basic progress charts

* Mobile responsive design

* Push notifications

* Social features (workout sharing)

This LLD specification contains all necessary technical details to implement the MVP of the strength training logging application, considering the limitations of Raspberry Pi Zero 2 W and preparation for automated testing.