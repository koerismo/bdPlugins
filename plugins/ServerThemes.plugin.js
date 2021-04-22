/**
 * @name ServerThemes
 * @author Baguettery
 * @description Allows servers to set custom themes for discord!
 * @version 1.0.3
 * @updateUrl https://raw.githubusercontent.com/koerismo/bdPlugins/main/plugins/ServerThemes.plugin.js
 */

module.exports = class ServerThemes {
    start() {
      // register channel listener
      this.bdfdb = BDFDB_Global.PluginUtils.buildPlugin()[1]
      ZeresPluginLibrary.Patcher.instead('ServerThemes', ZeresPluginLibrary.WebpackModules.find(m => m.dispatch), "dispatch", (obj,args,origf) => {this.onEvent(obj,args,origf,this)})
    }
    stop() {
      // unregister message listener
      ZeresPluginLibrary.Patcher.unpatchAll('ServerThemes')
    }

    getAllChannels() {
      /* TODO: This isn't efficient in the slightest. Cache? */
      let chnls = this.bdfdb.LibraryModules.ChannelStore.getMutableGuildChannels()
      // holy shit this is the hackiest thing ever
      return Object.keys(chnls).filter((x)=>{return chnls[x].guild_id == ZeresPluginLibrary.DiscordAPI.currentGuild.id}).map((x)=>{return chnls[x]})
    }

    cleanCSSValue(x) {
        return x.split('').filter((y)=>{return '#1234567890abcdefghijklmnopqrstuvwyz'.includes(y.toLowerCase())}).join('')
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
          '--scrollbar-auto-thumb'
        ]

        let themeChannels = this.getAllChannels().filter((x)=>{return (x.type == 0 && x.name == 'info-bdtheme')})


        BdApi.clearCSS("ServerThemes")
        if (themeChannels.length > 0) {
          try {
            let json_unfiltered = JSON.parse(themeChannels[0].topic)
            // Filter json
            let json = {}
            Object.keys(json_unfiltered).forEach((x)=>{
              if (acceptableKeys.includes(x)) {json[x] = this.cleanCSSValue(json_unfiltered[x])}
            })
            // Add css
            let css = '\n:root {\n'+Object.keys(json).map((x)=>{return ` ${x}: ${json[x]};`}).join('\n')+'\n}'
            BdApi.injectCSS("ServerThemes",css)
          }
          catch(e) {
            console.error('An error occured while parsing theme!',e)
          }
        }

      }
    }
}
