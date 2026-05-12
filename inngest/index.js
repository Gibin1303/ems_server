// import { Inngest } from "inngest";
// import Attendance from "../models/Attendance.js";
// import Employee from "../models/Employee.js";
// import LeaveApplication from "../models/LeaveApplication.js";
// import sendEmail from "../config/mail.js";

// export const inngest = new Inngest({ id: "fullstack-ems" });

// // auto checkout employee

// const autoCheckout = inngest.createFunction(
//   { id: "auto-check-out", triggers: { event: "employee/check-out" } },
//   //   { event: "employee/check-out" },
//   async ({ event, step }) => {
//     const { employeeId, attendanceId } = event.data;

//     await step.sleepUntil(
//       "wait-for-9-hours",
//       new Date(new Date().getTime() + 9 * 60 * 60 * 1000),
//     );

//     let attendance = await Attendance.findById(attendanceId);

//     if (!attendance?.checkOut) {
//       const employee = await Employee.findById(employeeId);

//       // send reminder mail
//       await sendEmail({
//         to: employee.email,
//         subject: "Attendance Reminder email",
//         body: `
// <div style="max-width:600px; margin:auto; font-family:Arial, sans-serif; padding:20px; color:#333;">
  
//   <h2 style="color:#000;">
//     Hi ${employee.firstName}, 👋
//   </h2>

//   <p style="font-size:16px; line-height:1.6;">
//     You have a check-in in 
//     <span style="font-weight:bold;">${employee.department}</span> today:
//   </p>

//   <p style="
//       font-size:18px;
//       font-weight:bold;
//       color:#007bff;
//       margin:8px 0;
//     ">
//     ${attendance?.checkIn?.toLocaleTimeString()}
//   </p>

//   <p style="font-size:16px; line-height:1.6;">
//     Please make sure to check-out in one hour.
//   </p>

//   <p style="font-size:16px; line-height:1.6;">
//     If you have any questions, please contact your admin.
//   </p>

//   <br />

//   <p style="font-size:16px; margin-bottom:0;">
//     Best Regards,
//   </p>

//   <p style="
//       font-size:16px;
//       font-weight:bold;
//       margin-top:4px;
//     ">
//     EMS
//   </p>

// </div>
// `,
//       });
//       // after 10hrs mark attendance as checked out with status "LATE"
//       await step.sleepUntil(
//         "wait-for-the-1-hour",
//         new Date(new Date().getTime() + 1 * 60 * 60 * 1000),
//       );

//       attendance = await Attendance.findById(attendanceId);
//       if (!attendance?.checkOut) {
//         attendance.checkOut =
//           new Date(attendance?.checkIn).getTime() + 4 * 60 * 60 * 1000;
//         attendance.workingHours = 4;
//         attendance.dayType = "Half Day";
//         attendance.status = "LATE";
//         await attendance.save();
//       }
//     }
//   },
// );

// // send email to admin , idf admin does not take action on  leave application within 24 hrs
// const leaveApplicationReminder = inngest.createFunction(
//   { id: "leave-application-reminder", triggers: { event: "leave/pending" } },

//   async ({ event, step }) => {
//     const { leaveApplicationId } = event.data;

//     await step.sleepUntil(
//       "wait-for-the-24-hours",
//       new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
//     );

//     const leaveApplication =
//       await LeaveApplication.findById(leaveApplicationId);

//     if (leaveApplication?.status === "PENDING") {
//       const employee = await Employee.findById(leaveApplication.employeeId);

//       //   send reminder email
//       await sendEmail({
//         to: process.env.ADMIN_EMAIL,
//         subject: "Leave Application Reminder",
//         body: `
// <div style="max-width: 600px;">

//   <h2>
//     Hi Admin, 👋
//   </h2>

//   <p style="font-size: 16px;">
//     You have a leave application in 
//     ${employee.department} today:
//   </p>

//   <p style="
//       font-size: 18px;
//       font-weight: bold;
//       color: #007bff;
//       margin: 8px 0;
//     ">
//     ${leaveApplication?.startDate?.toLocaleDateString()}
//   </p>

//   <p style="font-size: 16px;">
//     Please make sure to take action on this leave application.
//   </p>

//   <br />

//   <p style="font-size: 16px;">
//     Best Regards,
//   </p>

//   <p style="font-size: 16px;">
//     EMS
//   </p>

// </div>
// `,
//       });
//     }
//   },
// );

// const attendanceReminderCron = inngest.createFunction(
//   {
//     id: "attendance-reminder-cron",
//     triggers: [{ cron: "TZ=Asia/Kolkata 30 11  * * *" }],
//   },

//   async ({ step }) => {
//     const today = await step.run("get-today-date", () => {
//       const startUtc = new Date(
//         new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }) +
//           "T00:00:00+05:30",
//       );

//       const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);
//       return { startUtc: startUtc.toISOString(), endUtc: endUtc.toISOString() };
//     });

//     const activeEmployees = await step.run("get-active-employees", async () => {
//       const employees = await Employee.find({
//         isDeleted: false,
//         employmentStatus: "ACTIVE",
//       }).lean();
//       return employees.map((e) => ({
//         _id: e._id.toString(),
//         firstName: e.firstName,
//         lastName: e.lastName,
//         email: e.email,
//         department: e.department,
//       }));
//     });

//     const onLeaveIds = await step.run("get-on-leave-ids", async () => {
//       const leaves = await LeaveApplication.find({
//         status: "APPROVED",
//         startDate: { $lte: new Date(today.endUtc) },
//         endDate: { $gte: new Date(today.startUtc) },
//       }).lean();
//       return leaves.map((l) => l.employeeId.toString());
//     });

//     const checkedInIds = await step.run("get-checked-in-ids", async () => {
//       const attendances = await Attendance.find({
//         date: { $gte: new Date(today.startUtc), $lt: new Date(today.endUtc) },
//       }).lean();

//       return attendances.map((a) => a.employeeId.toString());
//     });

//     const absentEmployees = activeEmployees.filter(
//       (emp) => !onLeaveIds.includes(emp._id) && !checkedInIds.includes(emp._id),
//     );

//     if (absentEmployees.length > 0) {
//       await step.run("send-reminder-emails", async () => {
//         const emailPromises = absentEmployees.map((emp) => {
//           return sendEmail({
//             to: emp.email,
//             subject: "Attendance Reminder - Please mark your attendance ",
//             body: `<div style=" max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; color: #333; "> <h2 style="margin-bottom: 20px;">
//              Hi ${emp.firstName}, 👋 </h2>
//               <p style="font-size: 16px; line-height: 1.6;"> This is a reminder to mark your attendance for today. </p>
//                <p style=" font-size: 18px; font-weight: bold; color: #007bff; margin: 12px 0; "> Attendance Pending </p> <p style="font-size: 16px; line-height: 1.6;"> Please log in to the EMS portal and complete your check-in. </p> 
//                <p style="font-size: 16px; line-height: 1.6;"> If you have already marked your attendance, please ignore this email. </p>
//                 <br /> 
//                 <p style="font-size: 16px; margin-bottom: 0;"> Best Regards, </p> <p style=" font-size: 16px; font-weight: bold; margin-top: 4px; "> EMS </p> </div> `,
//           });
//         });
//             await Promise.all(emailPromises);
//             return {emailsSent:absentEmployees.length}

//       });
//     }

//     return {
//       totalActive: activeEmployees.length,
//       onLeave: onLeaveIds.length,
//       checkedIn: checkedInIds.length,
//       absent: absentEmployees.length,
//     };
//   },
// );

// export const functions = [
//   autoCheckout,
//   leaveApplicationReminder,
//   attendanceReminderCron,
// ];

// // import { Inngest } from "inngest";
// // import Attendance from "../models/Attendance.js";
// // import Employee from "../models/Employee.js";

// // export const inngest = new Inngest({ id: "fullstack-ems" });

// // // auto checkout employee
// // const autoCheckout = inngest.createFunction(
// //   {
// //     id: "auto-check-out",
// //     triggers: [{ event: "employee/check-out" }],
// //   },
// //   async ({ event, step }) => {
// //     const { employeeId, attendanceId } = event.data;

// //     await step.sleepUntil(
// //       "wait-for-9-hours",
// //       new Date(Date.now() + 9 * 60 * 60 * 1000)
// //     );

// //     let attendance = await Attendance.findById(attendanceId);

// //     if (!attendance?.checkOut) {
// //       const employee = await Employee.findById(employeeId);

// //       // send reminder mail

// //       await step.sleepUntil(
// //         "wait-for-the-1-hour",
// //         new Date(Date.now() + 1 * 60 * 60 * 1000)
// //       );

// //       attendance = await Attendance.findById(attendanceId);

// //       if (!attendance?.checkOut) {
// //         attendance.checkOut =
// //           new Date(attendance?.checkIn).getTime() + 4 * 60 * 60 * 1000;

// //         attendance.workingHours = 4;
// //         attendance.dayType = "Half Day";
// //         attendance.status = "LATE";

// //         await attendance.save();
// //       }
// //     }
// //   }
// // );

// // export const functions = [autoCheckout];



import { Inngest } from "inngest";
import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import LeaveApplication from "../models/LeaveApplication.js";
import sendEmail from "../config/mail.js";

export const inngest = new Inngest({ id: "fullstack-ems" });

// auto checkout employee

const autoCheckout = inngest.createFunction(
  {
    id: "auto-check-out",
    triggers: [{ event: "employee/check-out" }],
  },

  async ({ event, step }) => {
    const { employeeId, attendanceId } = event.data;

    await step.sleepUntil(
      "wait-for-9-hours",
      new Date(Date.now() + 9 * 60 * 60 * 1000),
    );

    let attendance = await Attendance.findById(attendanceId);

    if (!attendance?.checkOut) {
      const employee = await Employee.findById(employeeId);

      // send reminder mail
      await sendEmail({
        to: employee.email,
        subject: "Attendance Reminder email",
        body: `
<div style="max-width:600px; margin:auto; font-family:Arial, sans-serif; padding:20px; color:#333;">
  
  <h2 style="color:#000;">
    Hi ${employee.firstName}, 👋
  </h2>

  <p style="font-size:16px; line-height:1.6;">
    You have a check-in in 
    <span style="font-weight:bold;">${employee.department}</span> today:
  </p>

  <p style="
      font-size:18px;
      font-weight:bold;
      color:#007bff;
      margin:8px 0;
    ">
    ${new Date(attendance.checkIn).toLocaleTimeString()}
  </p>

  <p style="font-size:16px; line-height:1.6;">
    Please make sure to check-out in one hour.
  </p>

  <p style="font-size:16px; line-height:1.6;">
    If you have any questions, please contact your admin.
  </p>

  <br />

  <p style="font-size:16px; margin-bottom:0;">
    Best Regards,
  </p>

  <p style="
      font-size:16px;
      font-weight:bold;
      margin-top:4px;
    ">
    EMS
  </p>

</div>
`,
      });

      // after 10hrs mark attendance as checked out with status "LATE"
      await step.sleepUntil(
        "wait-for-the-1-hour",
        new Date(Date.now() + 1 * 60 * 60 * 1000),
      );

      attendance = await Attendance.findById(attendanceId);

      if (!attendance?.checkOut) {
        attendance.checkOut = new Date(
          new Date(attendance.checkIn).getTime() +
            4 * 60 * 60 * 1000,
        );

        attendance.workingHours = 4;
        attendance.dayType = "Half Day";
        attendance.status = "LATE";

        await attendance.save();
      }
    }
  },
);

// send email to admin if admin does not take action
// on leave application within 24 hrs

const leaveApplicationReminder = inngest.createFunction(
  {
    id: "leave-application-reminder",
    triggers: [{ event: "leave/pending" }],
  },

  async ({ event, step }) => {
    const { leaveApplicationId } = event.data;

    await step.sleepUntil(
      "wait-for-the-24-hours",
      new Date(Date.now() + 24 * 60 * 60 * 1000),
    );

    const leaveApplication =
      await LeaveApplication.findById(leaveApplicationId);

    if (leaveApplication?.status === "PENDING") {
      const employee = await Employee.findById(
        leaveApplication.employeeId,
      );

      // send reminder email
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: "Leave Application Reminder",
        body: `
<div style="max-width: 600px;">

  <h2>
    Hi Admin, 👋
  </h2>

  <p style="font-size: 16px;">
    You have a leave application in 
    ${employee.department} today:
  </p>

  <p style="
      font-size: 18px;
      font-weight: bold;
      color: #007bff;
      margin: 8px 0;
    ">
    ${new Date(
      leaveApplication.startDate,
    ).toLocaleDateString()}
  </p>

  <p style="font-size: 16px;">
    Please make sure to take action on this leave application.
  </p>

  <br />

  <p style="font-size: 16px;">
    Best Regards,
  </p>

  <p style="font-size: 16px;">
    EMS
  </p>

</div>
`,
      });
    }
  },
);

const attendanceReminderCron = inngest.createFunction(
  {
    id: "attendance-reminder-cron",
    triggers: [{ cron: "TZ=Asia/Kolkata 30 11 * * *" }],
  },

  async ({ step }) => {
    const today = await step.run("get-today-date", () => {
      const startUtc = new Date(
        new Date().toLocaleDateString("en-CA", {
          timeZone: "Asia/Kolkata",
        }) + "T00:00:00+05:30",
      );

      const endUtc = new Date(
        startUtc.getTime() + 24 * 60 * 60 * 1000,
      );

      return {
        startUtc: startUtc.toISOString(),
        endUtc: endUtc.toISOString(),
      };
    });

    const activeEmployees = await step.run(
      "get-active-employees",
      async () => {
        const employees = await Employee.find({
          isDeleted: false,
          employmentStatus: "ACTIVE",
        }).lean();

        return employees.map((e) => ({
          _id: e._id.toString(),
          firstName: e.firstName,
          lastName: e.lastName,
          email: e.email,
          department: e.department,
        }));
      },
    );

    const onLeaveIds = await step.run(
      "get-on-leave-ids",
      async () => {
        const leaves = await LeaveApplication.find({
          status: "APPROVED",
          startDate: {
            $lte: new Date(today.endUtc),
          },
          endDate: {
            $gte: new Date(today.startUtc),
          },
        }).lean();

        return leaves.map((l) =>
          l.employeeId.toString(),
        );
      },
    );

    const checkedInIds = await step.run(
      "get-checked-in-ids",
      async () => {
        const attendances = await Attendance.find({
          date: {
            $gte: new Date(today.startUtc),
            $lt: new Date(today.endUtc),
          },
        }).lean();

        return attendances.map((a) =>
          a.employeeId.toString(),
        );
      },
    );

    const absentEmployees = activeEmployees.filter(
      (emp) =>
        !onLeaveIds.includes(emp._id) &&
        !checkedInIds.includes(emp._id),
    );

    if (absentEmployees.length > 0) {
      await step.run(
        "send-reminder-emails",
        async () => {
          const emailPromises = absentEmployees.map(
            (emp) => {
              return sendEmail({
                to: emp.email,
                subject:
                  "Attendance Reminder - Please mark your attendance",
                body: `
<div style="max-width: 600px; margin: auto; padding: 20px; font-family: Arial, sans-serif; color: #333;">

  <h2 style="margin-bottom: 20px;">
    Hi ${emp.firstName}, 👋
  </h2>

  <p style="font-size: 16px; line-height: 1.6;">
    This is a reminder to mark your attendance for today.
  </p>

  <p style="
      font-size: 18px;
      font-weight: bold;
      color: #007bff;
      margin: 12px 0;
    ">
    Attendance Pending
  </p>

  <p style="font-size: 16px; line-height: 1.6;">
    Please log in to the EMS portal and complete your check-in.
  </p>

  <p style="font-size: 16px; line-height: 1.6;">
    If you have already marked your attendance,
    please ignore this email.
  </p>

  <br />

  <p style="font-size: 16px; margin-bottom: 0;">
    Best Regards,
  </p>

  <p style="
      font-size: 16px;
      font-weight: bold;
      margin-top: 4px;
    ">
    EMS
  </p>

</div>
`,
              });
            },
          );

          await Promise.all(emailPromises);

          return {
            emailsSent: absentEmployees.length,
          };
        },
      );
    }

    return {
      totalActive: activeEmployees.length,
      onLeave: onLeaveIds.length,
      checkedIn: checkedInIds.length,
      absent: absentEmployees.length,
    };
  },
);

export const functions = [
  autoCheckout,
  leaveApplicationReminder,
  attendanceReminderCron,
];