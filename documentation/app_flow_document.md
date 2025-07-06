# App Flow Document

## Onboarding and Sign-In/Sign-Up

When a brand-new user arrives, they first land on a simple welcome page that explains the platform’s purpose and prompts them to sign in using their institution’s single sign-on. The user selects their school or hospital from a dropdown list and is redirected to the familiar login screen of their identity provider. After entering their usual credentials, they return to the app where a brief consent screen appears, describing HIPAA-compliant storage rules and video retention policies of up to seven years. Upon agreeing, the user completes an optional mini tutorial highlighting key features, then is taken directly to their dashboard. Signing out happens with a single button click in the top navigation bar, clearing the session and returning the user to the welcome page. If a user ever forgets their password or encounters an issue, the app provides a clear link back to the institution’s password recovery portal so they can reset credentials outside of this platform.

## Main Dashboard or Home Page

After login, the user lands on a personalized dashboard that serves as the central hub. Across the top is a notification bell icon showing any new feedback or resource suggestions. Below this, users see a summary of pending video analyses, completed submissions, and a progress chart illustrating performance trends over time. A prominent button invites them to upload a new surgical video, while another link opens the curated learning library. In the sidebar, navigation links lead to the video upload area, feedback history, resource library, subscription settings, and user preferences. Clear breadcrumbs and headers ensure users always know where they are and how to move from one section to another.

## Detailed Feature Flows and Page Transitions

When a user clicks the upload button, they arrive at the video submission page. Here, they choose a file from their computer, and the interface immediately displays an upload progress bar. Supported formats like MP4 and MOV are automatically detected. Once the transfer finishes, the app shows a confirmation page stating that the video is secure and encrypted, and gives an estimated time for AI analysis to complete. The system then redirects the user back to the dashboard, where a spinning icon indicates the video is being processed.

As the AI processing begins, the SlowFast model analyzes the footage step by step. The user can check the real-time status either on the dashboard or by clicking into the analysis queue section. When the engine finishes, the app triggers both an in-app alert and an email, each containing a direct link to the new feedback page.

On the feedback review page, a video player loads the user’s submission alongside an overlay of annotated markers highlighting key moments. A side-by-side expert comparison plays in sync. Below the player, descriptive text points out errors, procedural deviations, and efficiency improvements. Each coaching tip includes a link to matching learning resources for deeper study. A download button lets students export the full feedback report as a PDF, suitable for offline review or sharing with mentors.

Under the feedback view, the learning resources section presents a filtered library of expert videos, guides, and best practice documents. Filters for procedure type and difficulty appear at the top so users can refine the content. This list updates automatically based on the AI’s assessment, ensuring the resources align with the student’s individual needs.

Instructors and administrators access a dedicated review interface by selecting the “Admin” link in the sidebar. Here they see all student submissions in a table format. By clicking into any record, they can view the AI’s original feedback and make manual edits or annotations. After saving their adjustments, the system logs each change in a version history for auditing and quality control. Students then receive a new notification whenever an instructor-modified report is published.

Subscription management is available under the account menu. Both individual students and institutional administrators can view current plans, choose between monthly or annual billing, and update payment methods. The app displays upcoming renewal dates and past invoices. If a payment fails, the user enters a brief grace period with email and in-app reminders prompting them to re-enter valid billing information.

All videos and analysis results remain stored for up to seven years in a secure archive. After this retention period, the system either purges or moves files to cold storage according to the institution’s policy. Users may also request manual deletion of specific content via their account settings.

## Settings and Account Management

From the user menu in the top right, users access their personal settings page. Here they can update their display name, contact email, and notification preferences for both email and in-app alerts. They can review privacy statements and withdraw consent if needed. Subscription settings live on a separate tab, where billing details, plan changes, and payment history are managed. A link returns the user directly to the main dashboard when they are done.

## Error States and Alternate Paths

If a user attempts to upload an unsupported file format, the upload page instantly displays a clear error message explaining the accepted formats and prompts them to select a new file. In cases of network failure during upload or analysis, the app shows a warning banner and automatically retries when connectivity returns. Should a session time out, any unsaved changes are preserved, and the user is redirected to the sign-in page with a note explaining the timeout. During billing failures, the subscription page highlights overdue status and reminds the user to update payment information, but continues allowing access to historical feedback during the grace period.

## Conclusion and Overall App Journey

Starting from a seamless single sign-on, the user quickly lands on a comprehensive dashboard showing pending and past analyses. Uploading a surgical video leads them through a guided flow into AI processing, with real-time status updates. Once analysis is ready, they explore richly annotated feedback alongside expert comparisons and tailored learning resources. Instructors and administrators can step in to refine feedback, while subscription and billing flows keep access running smoothly. Throughout, clear error handling and a robust settings area ensure that users face no dead ends. This journey, from sign-up to daily use, supports students and educators in advancing surgical skills through AI-driven insights.