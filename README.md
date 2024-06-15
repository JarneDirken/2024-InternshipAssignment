# 🥷🏽 Next.js E-borrowing system

A E-borrowing system project with Next.js and TypeScript for our international internship assignment. Teammembers:

- [Jarne Dirken](https://github.com/jarnedirken)
- [Sohaib Ibenhajene](https://github.com/SohaibIbenhajene)

## 🍿 Demo

If you are not interested with all the technical details of our application you can try it out yourself by going to [our website](https://2024-internship-assignment.vercel.app/)

- Student: email: `user1user@kmitl.ac.th` password: `B#v9B*y7e&sUF2`
- Supervisor: email: `user2supervisor@kmitl.ac.th` password: `!VYB^^6c4&N@a2`
- Admin: email: `user3admin@kmitl.ac.th` password: `WayDnTHR!H55y*`

## 📦 Technologies

- `Next.js 14`
- `TypeScript`
- `Tailwind`
- `Prisma`
- `Firebase`
- `MUI`

## 🦄 Features

Here's a quick overview of what you can do with our E-borrowing system. If you want to see a more detailed explanation download [this file](https://github.com/JarneDirken/2024-InternshipAssignment/blob/main/files/ManualUsers.pdf):

- **Create an account**: You can create an account and view your personal data with the help of firebase.

- **Borrow and return items**: You can borrow items, cancel request. When borrowing an item you can return that item.

- **View your history**: You can view the history of all the items you have borrowed.

- **Approve / reject borrows**: As a supervisor you can accept / reject borrow request from students.

- **Hand over / receive items**: As a supervisor you can hand over / receive items that students want to borrow.

- **Export and import data from excel**: You can import data form excel or export data to excel.

- **Generate QR-codes**: You can select products and generate QR codes for them.

- **Cruds for items, users and locations**: We have curds for the items, users and locations.

## 👩🏽‍🍳 The Process

We started by receiving our project. The first 3 weeks of our insternship was solely focussed on doing research and making the screens in figma. This way we will have all the knowledge with what our customer wants and the customer would have a clear look on how the application is going to look like.

After that we started programming. We devided the work so that we could work simultaneously. Jarne started working on the database and Sohaib started working on the project layout and home / dashboard screens.

After that we started doing our thing, Jarne created most student and supervisor pages while sohaib created the admin and authentication pages. This was solid teamwork because with that we could both do our thing and merge everything together without running into issues.

We had some intermediate meetings that way we would know if we are still on the right track. All went smoothly and we made our customer very happy.

Thank you @KMITL for giving us this amazing opportunity.

## 📚 What I Learned

During this project, I've picked up important skills and a better understanding of complex ideas, which improved my logical thinking. Because this was a bigger project I learned to work alone on certain parts and ask for help where needed.

### 🧠 Brain:

- **Logical Thinking**: Working with a complete new language for the first time and on top it was a full stack language required some logical thinking.

### 📏 Team coordination:

- **Working as a team**: Wokring as a team is very important, this project really helped me thinking about being in a team.

### 🎨 Discovering Figma:

- **New Tools**: Starting the project of we created everything in figma. This helped us get a better idea of what to program later on.

### ⌚ Time management:

- **Using scrum board**: Keeping track of all our tasks using a scrum board really made everything organised. For this project we used Trello.

### 📓 New knowledge:

- **Next.js**: First time using a full stack programming language. At first it was a bit overwelming but after working with it for a bit it became clear that for projects like this, next js a really good chose is.
- **Firebase**: This is what we used for authentication, file storage and notification system. A really great tool designed by google!
- **Prisma**: Creating our database and running api calls was all with the help of prisma.
- **Vercel**: At our insternship we used their servers to host our web appliation. For personal use I also made it available on vercel with dummy data.

### 🎡 Security:

- **API Security**: Here I learned how to "secure" an api with users that are logged in. So you can't make api calls from other users or when you're not logged in. Also we checked on what user can make what API calls. Meaning a student can never make api calls a supervisor can do.

### 📈 Overall Growth:

Each part of this project helped me understand more about building apps, managing complex information, and improving user experience. It was more than just making a borrowing system. It was about solving problems, learning new things, and improving my skills for future work.

## 💭 How can it be improved?

- Styling the application more
- Implementing more features

## 🚦 Running the Project

To run the project in your local environment, follow these steps:

1. Clone the repository to your local machine.
2. Run `npm install` or `yarn` in the project directory to install the required dependencies.
3. Run `npm run start` or `yarn start` to get the project started.
4. Open [http://localhost:8000](http://localhost:8000) (or the address shown in your console) in your web browser to view the app.
