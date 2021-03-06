/**
 * @name ServerThemes
 * @author Baguettery
 * @description Allows servers to set custom themes for discord!
 */

module.exports = class ServerThemes {
    getVersion() {return '1.0.9'}

    start() {
      // check for updates
      ZeresPluginLibrary.PluginUpdater.checkForUpdate('ServerThemes', this.getVersion(), 'https://raw.githubusercontent.com/koerismo/bdPlugins/main/plugins/ServerThemes.plugin.js')

      // register channel listener
      this.bdfdb = BDFDB_Global.PluginUtils.buildPlugin()[1]
      ZeresPluginLibrary.Patcher.instead('ServerThemes', ZeresPluginLibrary.WebpackModules.find(m => m.dispatch), "dispatch", (obj,args,origf) => {this.onEvent(obj,args,origf,this)})

      // inject initial css
      BdApi.injectCSS("ServerThemes",`
      .chat-3bRxxu section.title-3qD0b- {
        background-color: var(--topbar-background-color);
        background-image: var(--topbar-background-image);
        background-size: cover;
        background-position: left center;
      }
      .chat-3bRxxu section.title-3qD0b- h3 {color: var(--topbar-primary);}
      .chat-3bRxxu section.title-3qD0b- .topic-TCb_qw {color: var(--topbar-secondary);}
      .chat-3bRxxu section.title-3qD0b- .children-19S4PO:after {background: linear-gradient(90deg,rgba(54,57,63,0) 0,var(--topbar-background-color));}
      .chat-3bRxxu section.title-3qD0b- .iconWrapper-2OrFZ1 .da-icon {color: var(--topbar-secondary);}
      .chat-3bRxxu section.title-3qD0b- .iconWrapper-2OrFZ1.selected-1GqIat .icon-22AiRD {color: var(--topbar-primary);}
      `)
      // End
    }
    stop() {
      // clear css
      BdApi.clearCSS("ServerThemes")
      BdApi.clearCSS("ServerThemes_theme")
      // unregister message listener
      ZeresPluginLibrary.Patcher.unpatchAll('ServerThemes')
    }

    getAllChannels() {
      /* TODO: This isn't efficient in the slightest. Cache? */
      let chnls = this.bdfdb.LibraryModules.ChannelStore.getMutableGuildChannels()
      // holy shit this is the hackiest thing ever
      return Object.keys(chnls).filter((x)=>{return chnls[x].guild_id == ZeresPluginLibrary.DiscordAPI.currentGuild.id}).map((x)=>{return chnls[x]})
    }

    checkURL(url) {
      let acceptableDomains = [
        'raw.githubusercontent.com',//GitHub
        'i.imgur.com',              //Imgur
        'dl.dropboxusercontent.com',//Dropbox
        'media.discordapp.net',     //Discord
        'cdn.discordapp.com'        //Discord
      ]
      var parsed
      try {parsed = new URL(url)}
      catch {console.warn('ServerThemes: Unable to resolve header image URL!');return false}
      return (acceptableDomains.includes(parsed.hostname))
    }

    cleanCSSValue(x) {
        return x.split('').filter((y)=>{return '#1234567890abcdefghijklmnopqrstuvwyz:/.'.includes(y.toLowerCase())}).join('')
        // TODO: Does allowing :/. introduce any possible exploits?
    }

    onEvent(disp,args,orig,self) {
      orig(...args)
      if (args[0].type === 'CHANNEL_SELECT') {

        // Set theme
        let acceptableKeys = [
          '--text-normal',
          '--text-muted',
          '--text-link',
          '--channels-default',

          '--interactive-normal',
          '--interactive-hover',
          '--interactive-active',
          '--interactive-muted',

          '--background-primary',
          '--background-secondary',
          '--background-secondary-alt',
          '--background-tertiary',
          '--background-accent',
          '--background-floating',
          '--channeltextarea-background',

          '--scrollbar-auto-track',
          '--scrollbar-auto-thumb',
          /* Custom rules */
          '--topbar-background-color',
          '--topbar-background-image',
          '--topbar-primary',
          '--topbar-secondary'
        ]

        let themeChannels = []
        if (ZeresPluginLibrary.DiscordAPI.currentGuild != null)
          themeChannels = this.getAllChannels().filter((x)=>{return (x.type == 0 && x.name == 'info-bdtheme')})


        BdApi.clearCSS("ServerThemes_theme")
        if (themeChannels.length > 0) {
          try {
            let json_unfiltered = JSON.parse(themeChannels[0].topic)
            // Filter json
            let json = {}
            Object.keys(json_unfiltered).forEach((x)=>{
              if (acceptableKeys.includes(x)) {json[x] = this.cleanCSSValue(json_unfiltered[x])}
            })

            if (json['--topbar-background-image'] && !this.checkURL(json['--topbar-background-image'])) {
              json['--topbar-background-image'] = ''
            }
            else {json['--topbar-background-image'] = `url(${json['--topbar-background-image']})`}

            // Add theme css
            let css = `
            :root {
            `+Object.keys(json).map((x)=>{return ` ${x}: ${json[x]};`}).join('\n')+`
            }`

            BdApi.injectCSS("ServerThemes_theme",css)
          }
          catch(e) {
            console.error('An error occured while parsing theme!',e)
          }
        }

      }
    }
}
