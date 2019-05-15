Channelicon
===

Better your slack channel.

### Channel icon

#### Channel
+ By default, shown identicon as icon.
+ If image's url was set into channel purpose, shown it as icon.
  - Confuguration format: `__icon[http|https://your.host.com/awesome-icon.jpg]`
  - Write above config text on independent line. (FYI: Press `SHIFT+Enter` to insert new line)

#### DM
+ Shown user's/app's avator as icon.
+ On multiparty direct message, shown identicon as icon. (can't change now)

### For paranoids (like me)

#### Why this extension needs stongly permissions?
It needs permissions about "webRequest".
This is for only recycle slack-api token for retrive channel info.
See source code to check that extension return intercepted response without any changes.
