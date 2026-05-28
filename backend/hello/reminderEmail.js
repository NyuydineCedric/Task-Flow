export function reminderEmailHTML(task, label) {
  const prioColor = task.priority === 'high' ? '#EF4444'
    : task.priority === 'medium' ? '#F59E0B' : '#16C47F'

  const dueFormatted = task.due
    ? new Date(task.due).toLocaleString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric',
        hour: 'numeric', minute: '2-digit',
      })
    : 'No due date'

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Task Reminder</title>
</head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#0F172A;border-radius:16px 16px 0 0;padding:28px 36px;text-align:center;">
            <div style="display:inline-flex;align-items:center;gap:10px;">
              <span style="background:#16C47F;border-radius:8px;padding:6px 10px;font-size:20px;">⚡</span>
              <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">TaskFlow</span>
            </div>
            <p style="color:rgba(255,255,255,0.45);font-size:13px;margin:8px 0 0;">Productivity Reminder</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:#ffffff;padding:36px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;">

            <!-- Alert banner -->
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 18px;margin-bottom:24px;">
              <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-size:22px;">⏰</span>
                <div>
                  <div style="font-size:13px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:0.05em;">Reminder</div>
                  <div style="font-size:14px;color:#166534;margin-top:2px;">
                    Your task is due <strong>${label}</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- Task card -->
            <div style="border:1.5px solid #E2E8F0;border-radius:12px;overflow:hidden;margin-bottom:24px;">
              <div style="border-left:4px solid ${prioColor};padding:20px 22px;">
                <h2 style="margin:0 0 8px;font-size:18px;font-weight:700;color:#0F172A;line-height:1.3;">
                  ${task.title}
                </h2>
                ${task.description
                  ? `<p style="margin:0 0 14px;font-size:14px;color:#64748B;line-height:1.6;">${task.description}</p>`
                  : ''}
                <table cellpadding="0" cellspacing="0" style="width:100%;">
                  <tr>
                    <td style="padding-right:16px;vertical-align:top;">
                      <div style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px;">Category</div>
                      <div style="font-size:13px;font-weight:500;color:#0F172A;">${task.category}</div>
                    </td>
                    <td style="padding-right:16px;vertical-align:top;">
                      <div style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px;">Priority</div>
                      <div style="display:inline-block;background:${prioColor}18;color:${prioColor};font-size:12px;font-weight:700;padding:2px 10px;border-radius:99px;text-transform:capitalize;">
                        ${task.priority}
                      </div>
                    </td>
                    <td style="vertical-align:top;">
                      <div style="font-size:11px;font-weight:600;color:#94A3B8;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:3px;">Due</div>
                      <div style="font-size:13px;font-weight:500;color:#0F172A;">${dueFormatted}</div>
                    </td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- CTA button -->
            <div style="text-align:center;margin-bottom:24px;">
              <a href="http://localhost:5173/tasks"
                style="display:inline-block;background:#16C47F;color:#ffffff;font-size:14px;font-weight:700;padding:13px 32px;border-radius:10px;text-decoration:none;letter-spacing:0.02em;">
                ✅ Open Task in TaskFlow
              </a>
            </div>

            <!-- Tips -->
            <div style="background:#F8FAFC;border-radius:10px;padding:16px 18px;">
              <div style="font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;">
                💡 Quick Tips
              </div>
              <div style="font-size:13px;color:#475569;line-height:1.8;">
                • Break the task into smaller steps<br/>
                • Use Focus Mode for deep work<br/>
                • Mark it done to earn XP points
              </div>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F1F5F9;border-radius:0 0 16px 16px;border:1px solid #E2E8F0;border-top:none;padding:20px 36px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#94A3B8;">
              Sent by <strong style="color:#16C47F;">TaskFlow</strong> · Your productivity companion
            </p>
            <p style="margin:0;font-size:11px;color:#CBD5E1;">
              You're receiving this because you set a reminder for this task.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `.trim()
}

export function reminderEmailText(task, label) {
  return `
TASKFLOW — Task Reminder
========================

Your task is due ${label}:

📋 Task:     ${task.title}
📁 Category: ${task.category}
🚨 Priority: ${task.priority.toUpperCase()}
📅 Due:      ${task.due ? new Date(task.due).toLocaleString() : 'No due date'}
${task.description ? `\n📝 Notes:\n${task.description}` : ''}

Open TaskFlow: http://localhost:5173/tasks

— TaskFlow Team
  `.trim()
}