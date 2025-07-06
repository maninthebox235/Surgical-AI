flowchart TD
  A[Start] --> B[Login via SSO]
  B --> C{Login Successful}
  C -- Yes --> D[User Dashboard]
  C -- No --> E[Login Error and Retry]
  D --> F[Upload Surgical Video]
  D --> G[View Learning Resources]
  D --> H[View Progress Tracking]
  D --> I[Subscription Management]
  D --> M[Logout]
  F --> J[Secure Video Upload]
  J --> K[Store Video HIPAA Compliant]
  K --> L[Queue Video for Analysis]
  L --> N[AI Video Analysis]
  N --> O[Generate Annotated Feedback]
  O --> P[Feedback Dashboard]
  P --> Q[Annotated Video Playback]
  P --> R[Expert Procedure Comparison]
  P --> S[Text Coaching Suggestions]
  P --> T[Export Feedback PDF]
  P --> Y[Send InApp and Email Notifications]
  P --> U[Instructor Review Request]
  U --> V{Is Admin Role}
  V -- Yes --> W[Adjust AI Feedback]
  W --> P
  V -- No --> X[Access Denied]
  E --> B
  M --> Z[End]