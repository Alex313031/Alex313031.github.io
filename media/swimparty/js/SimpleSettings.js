// SimpleSettings.js
import saveAs from 'save-as'

var iterateKeys = (obj, callback) => {
  Object.keys(obj).forEach( callback );
}

var recurrsiveSetConfig = (newSettings, config) => {

  iterateKeys(newSettings, el => {

    if( config[el] === undefined )  return

    // THREE converts Color to hex value in toJSON so we need to test fo it
    if( config[el].isColor ) {

      config[el].setHex(newSettings[el])

    } else if( typeof newSettings[el] !== 'object') {

      config[el] = newSettings[el]

    } else {

      recurrsiveSetConfig( newSettings[el], config[el] )

    }

  })

}



function SimpleSettings( loadingManager ) {

  var jsonLoader = new THREE.FileLoader( loadingManager );
  jsonLoader.setResponseType( 'json' );


  var save = (config, suggestedName) => {

    let blob = new Blob( [JSON.stringify(config, null, 2 )], { type : 'application/json' } )

    saveAs( blob, suggestedName || 'config.json' )

  }

  var setConfig = (settings, config) => {

    recurrsiveSetConfig( settings, config );

  }

  var load = (jsonurl, config) => {

    jsonLoader.load( jsonurl, result => {

      setConfig( result, config )

    } )

  }


  return {
    save: save,
    load: load,
    jsonLoader: jsonLoader,
    setConfig: setConfig
  }

}

module.exports = SimpleSettings
