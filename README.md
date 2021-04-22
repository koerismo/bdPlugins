# bdPlugins
Some plugins i made for betterbandageddiscord.


## Plugin List
| Plugin Name | Plugin Description |
| ----------- | ------------------ |
| ServerThemes | Adds server-specific themes that can be controlled by administrators. |



## How to use:
### ServerThemes
If you own a server, you can create a channel named `info-bdtheme`, set the description to whatever css rules you want to modify (Access is limited, though.) in JSON format, hide it from all users, and save.
Example JSON-formatted css rules:
```json
{
  "--background-primary":"#222",
  "--background-secondary":"#333",
  "--background-tertiary":"#252525",
  "--background-secondary-alt":"#333",
  "--background-accent":"#444",
  "--channeltextarea-background":"#333"
}
```
