import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def send_invitation_email(to_email, project_name, inviter_name, role, accept_url, task_info=""):
    mail_username = os.getenv(chr(77)+chr(65)+chr(73)+chr(76)+chr(95)+chr(85)+chr(83)+chr(69)+chr(82)+chr(78)+chr(65)+chr(77)+chr(69))
    mail_password = os.getenv(chr(77)+chr(65)+chr(73)+chr(76)+chr(95)+chr(80)+chr(65)+chr(83)+chr(83)+chr(87)+chr(79)+chr(82)+chr(68))
    mail_server = os.getenv(chr(77)+chr(65)+chr(73)+chr(76)+chr(95)+chr(83)+chr(69)+chr(82)+chr(86)+chr(69)+chr(82), chr(115)+chr(109)+chr(116)+chr(112)+chr(46)+chr(103)+chr(109)+chr(97)+chr(105)+chr(108)+chr(46)+chr(99)+chr(111)+chr(109))
    mail_port = int(os.getenv(chr(77)+chr(65)+chr(73)+chr(76)+chr(95)+chr(80)+chr(79)+chr(82)+chr(84), chr(53)+chr(56)+chr(55)))
    mail_from = os.getenv(chr(77)+chr(65)+chr(73)+chr(76)+chr(95)+chr(70)+chr(82)+chr(79)+chr(77), mail_username or chr(110)+chr(111)+chr(114)+chr(101)+chr(112)+chr(108)+chr(121)+chr(64)+chr(112)+chr(109)+chr(115)+chr(46)+chr(99)+chr(111)+chr(109))
    if not mail_username or not mail_password:
        sep = chr(61) * 60
        print(sep)
        print(chr(69)+chr(77)+chr(65)+chr(73)+chr(76)+chr(32)+chr(73)+chr(78)+chr(86)+chr(73)+chr(84)+chr(65)+chr(84)+chr(73)+chr(79)+chr(78)+chr(32)+chr(40)+chr(68)+chr(101)+chr(118)+chr(32)+chr(77)+chr(111)+chr(100)+chr(101)+chr(41))
        print(sep)
        print(chr(32)*2 + chr(84)+chr(79) + chr(32)*6 + chr(58)+chr(32) + to_email)
        print(chr(32)*2 + chr(80)+chr(82)+chr(79)+chr(74)+chr(69)+chr(67)+chr(84) + chr(32) + chr(58)+chr(32) + project_name)
        print(chr(32)*2 + chr(82)+chr(79)+chr(76)+chr(69) + chr(32)*4 + chr(58)+chr(32) + role)
        print(chr(32)*2 + chr(73)+chr(78)+chr(86)+chr(73)+chr(84)+chr(69)+chr(82) + chr(32) + chr(58)+chr(32) + inviter_name)
        print(chr(32)*2 + chr(65)+chr(67)+chr(67)+chr(69)+chr(80)+chr(84) + chr(32) + chr(58)+chr(32) + accept_url)
        print(sep)
        return True
    try:
        subject = chr(73)+chr(110)+chr(118)+chr(105)+chr(116)+chr(97)+chr(116)+chr(105)+chr(111)+chr(110)+chr(32)+chr(116)+chr(111)+chr(32)+project_name
        task_suffix = (" (Task: " + task_info.strip().lstrip(" for task:").strip() + ")") if task_info.strip() else ""
        text = inviter_name + chr(32)+chr(105)+chr(110)+chr(118)+chr(105)+chr(116)+chr(101)+chr(100)+chr(32)+chr(121)+chr(111)+chr(117)+chr(32)+chr(116)+chr(111)+chr(32) + project_name + task_suffix + chr(32)+chr(97)+chr(115)+chr(32) + role + chr(46)+chr(10)+chr(10)+chr(65)+chr(99)+chr(99)+chr(101)+chr(112)+chr(116)+chr(58)+chr(10) + accept_url
        msg = MIMEMultipart()
        msg[chr(83)+chr(117)+chr(98)+chr(106)+chr(101)+chr(99)+chr(116)] = subject
        msg[chr(70)+chr(114)+chr(111)+chr(109)] = mail_from
        msg[chr(84)+chr(111)] = to_email
        msg.attach(MIMEText(text))
        with smtplib.SMTP(mail_server, mail_port) as s:
            s.ehlo(); s.starttls(); s.login(mail_username, mail_password)
            s.sendmail(mail_from, [to_email], msg.as_string())
        return True
    except Exception as e:
        print(str(e))
        return False
