HOW TO USE
==========
1. Put your video in the  assets  folder and name it:  intro.mp4
2. Open index.html with VS Code "Live Server" (double-click will NOT load data.json).
3. Done. No code changes needed.

- Video missing?  The hero shows no picture, so keep assets/intro.mp4 in place.
- Different file name?  Change  "video"  in data.json.
- Want no video?  Set  "video": ""  in data.json.
- Page text, links, menu: edit data.json only.
- Tip: white video background blends into the cream page. Keep the file under ~10 MB.

SOUND (autoplay)
================
Browsers never allow sound before the visitor does something, so:
- The video starts muted, and sound starts on the visitor's first click / key press / tap anywhere.
- If the browser allows it, sound starts immediately with no click.
- For a guaranteed start, set  "splash": true  in data.json ("intro" section).
  Visitors then see a "Click to enter" screen, and one click starts the sound.
- To keep the video always silent until the Listen button is pressed:  "autoPlaySound": false

PROFILE PHOTO
=============
The round photo next to your name in the navbar is assets/profile.jpg (square image, any size).
To change it, replace that file. To remove it, delete "avatar" from data.json.

--- Skills section ---
Content: data.json -> "skills" (number, title, intro, categories[ {id,title,description,icon,items[{name,tag,percent,logo}]} ]).
Add a skill: add an item to a category. Add a category: add a new object to "categories".
Files: skills.js (logic), skills.css (design). Colors: variables at the top of skills.css.
