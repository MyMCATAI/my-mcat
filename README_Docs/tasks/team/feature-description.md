Feature: A new feature where SaraSwati in the content system where we'll will be able to accommodate for tutors. When tutors login, they should be able to have students assigned to them as tutors, and therefore we need to keep track of a tutor's relationship with a student. One tutor can have multiple students, a student can have at most one tutor assigned to them. and we should store that sort of relationship in some sort of database, and the tutor when they login to sarswati should see their students in a dashboard, should be able to send different tasks to the student, and for the student to login, you can see it on their tasks. 

homeworks types:
 - cars passage
 - ankiclinic flashcardset

-already exists - we can add calendar events to students via saraswati
-tutors have ability to add homework assignements that show up on students tasks - if student clicks on a particular task, the FE navigates correctly to it 
- sarasswati - contentID of test or passage - 

for example: tutor assigns cars passage in saraswati
      student sees it in "tasks", clicks on it, FE navigates to cars, pulls up passage

Start with ats and cars, don't worry about /tests (practice tests)

For anki clinic - we might have a  "homework" room.


Admin Vs Tutors
Idea: we do differentiate between Admin (mymcat staff) vs Tutors, by using a json / table of staff's emails, and we can feature gate things on saraswati.

------------

## Schema changes
// Students are a user that's premium, thats been assigned a tutor

```

model Student {
  id           String    @id @default(cuid())
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  name         String
  userId       String
  bio          String?

  // Relations
  sessions     Session[] // Sessions this student has attended
  userId       String?   @unique // Optional relation to a User model if you have one
  tutorId      String?  @unique // Optional relation to a Tutor model if you have one
}

model Tutor {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  name            String
  userId          String
  profileImage    String?
  bio             String?
  hourlyRate      Float?
  education       String?
  experience      String?

  // Relations
  Students        Student[] // Sessions this tutor has conducted
  Sessions        Sesssion[]
}

// Session model
model Session {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  description String?
  notes       String?       // Notes taken during the session

  // Relations
  studentId   String
  student     Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  tutorId     String
  tutor       Tutor    @relation(fields: [tutorId], references: [id], onDelete: Cascade)
}

```
---
## Tasks

### Saraswati

Esther - 
[ ] Creating a student dashboard page on saraswati for tutor users as well as requiring mymcat email authentication 
[ ] Bringing back public home page 
[ ] Requiring dev mymcat email authentication for admin/content pages
[ ] Backend making UI responsive and not just dummy data

Armaan - 
[ ] schema generation for student, tutor and session model
[ ] displaying mastery of a student for a Tutor on Saraswati

Dennis -
[ ] on MYMCAT FE - create a GlobalRouterActor when given an input ( can be mocked for now) can navigate correctly. 

Sophie - 
[ ] - look into uploading Tutors uploading video to generate session id

