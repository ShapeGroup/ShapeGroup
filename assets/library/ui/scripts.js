
/* --- WUSY BETA : Web Ui System */

class uiController {

    #lang
    #dictionary
    #tools = {

        'onDomReady' : fn =>{
            window.addEventListener( 'DOMContentLoaded' , fn )
        },
        'onDomCompleted' : fn =>{
            document.addEventListener( 'readystatechange', fn )
        },
        'onDomLoaded' : fn =>{
            window.addEventListener( 'load', fn )
        },
        'getOffsetTop': el => {
            let top = 0; while (el) { top += el.offsetTop; el = el.offsetParent; } return top;
        },
        'getOffsetLeft': el => {
            let left = 0; while (el) { left += el.offsetLeft; el = el.offsetParent; } return left;
        },
        'printl': str => {
            return this.#dictionary ? this.#lang[ this.#dictionary.en.findIndex( text => text.toLowerCase() === str.toLowerCase() ) ] : str
        }


    }

    constructor() {

        this.data = {}

        this.ready = ( async () => {

            return await this.init()

        })()

        this.unveil = obj => {
            return obj ? JSON.parse(JSON.stringify(obj), null, 4) : 'unveil requires an object or an array'
        }

    }

    async init() {

        if (Object.keys(this.data).length === 0) {

            this.data.automatisms = {}
            this.data.controllers = {}
            this.data.buttons = {}

            const getLanguages = new Promise ( async (resolve) => {

                if( document.querySelectorAll('[data-langs$="ui.lang.json"]')[0] ) {

                    let langsFile,langsRead,langsSrc

                    langsSrc = document.querySelectorAll('[data-langs$="ui.lang.json"]')[0]
                    if( langsSrc.dataset.langs ) {

                        try {

                            langsFile = await fetch(langsSrc.dataset.langs)
                            langsRead = await langsFile.json()
                        }

                        catch (e){

                            console.error(`⚠ [ ui alert ] ➔ Internal error on langs loader\n  ⮑ unfinded file or unreadable wrong json data on: `+langsSrc+`\n  ⮑ system error message:`,e)
                        }

                        finally{

                            this.#dictionary = langsRead
                            this.#lang = this.#dictionary[document.documentElement.lang]
                            if(!this.#lang) console.error(`⚠ [ ui alert ] ➔ Internal error on langs loader\n  ⮑ unfinded document lang (`+document.documentElement.lang+`) into json data on: `+langsSrc)
                            resolve()
                        }
                    }

                }

            })

            await Promise.allSettled([

                getLanguages,

                Promise.allSettled([

                    this.launchAutoRelativePositon(),
                    this.launchAutoOversizeScroll(),
                    this.launchAutoXScroll(),
                    this.launchPopups(),
                    this.launchTooltips(),

                    this.launchSelectbox(),
                    this.launchDropdown(),

                    this.launchCheckbox(),
                    this.launchRadiobox(),
                    this.launchPassword(),
                    this.launchRating(),
                    this.launchNumbers(),
                    this.launchRangeSliders(),
                    this.launchDatepiker()

                ])
            ])

            return this.data

        }

    }

    /* --- */

    // ready for beta
    async launchAutoRelativePositon (reload) {

        return this.data.automatisms.autoRelativePositions = await new Promise( resolve => {

            let startTask = async ( tools = this.#tools, result = [] ) => {

                document.querySelectorAll('.box-fit, .box-stretch').forEach( el => {

                    el.parentNode.classList.add('box-relative')
                    result.push(el)

                })

                resolve(result)

            }

            !! reload ? startTask() : this.#tools.onDomReady( () => startTask() )

        })

    }

    // ready for beta
    async launchAutoOversizeScroll (reload) {

        return this.data.automatisms.autoOversizedControl = await new Promise( resolve => {

            let startTask = async ( tools = this.#tools, result = [] ) => {

                document.querySelectorAll('.checksize, TABLE, CODE, PRE, OUTPUT').forEach( el => {

                    let dc = {/*dataCollection*/}

                    dc.status = 'not-defined'
                    dc.targetwidth = parseInt(el.offsetWidth),
                    dc.parentwidth = parseInt(el.parentNode.offsetWidth)

                    if ( ['TABLE','CODE','PRE','OUTPUT'].indexOf(el.tagName)>-1 ) {

                        if( dc.targetwidth > dc.parentwidth || dc.targetwidth > window.innerWidth || !el.parentElement.classList.contains('scroll-x') ) {

                            let scrollableWrap = document.createElement('div')

                            el.parentNode.insertBefore(scrollableWrap, el)
                            scrollableWrap.appendChild(el)
                            el.parentNode.classList.add('scroll-x','no-scrollbar')

                            dc.status = 'wrapped'

                        } else if( dc.targetwidth <= dc.parentwidth && el.parentNode.className.includes('checksize') ) {

                            el.parentNode.outerHTML = el.parentNode.innerHTML

                            dc.status = 'no-wrap'

                        }

                    } else {

                        if( dc.targetwidth > dc.parentwidth || dc.targetwidth > window.innerWidth || !el.parentElement.classList.contains('scroll-x') ) {

                            //wrap it
                            let scrollableWrap = document.createElement('div')

                            el.parentNode.insertBefore(scrollableWrap, el)
                            scrollableWrap.appendChild(el)
                            el.parentNode.classList.add('scroll-x','no-scrollbar','checksize')

                            dc.status = 'wrapped'

                        } else if( dc.targetwidth <= dc.parentwidth && el.parentNode.className.includes('checksize') ) {

                            el.parentNode.outerHTML = el.parentNode.innerHTML
                            dc.status = 'no-wrap'

                        }

                    }

                    result.push(dc)

                })

                resolve(result)

            }

            !! reload ? startTask() : this.#tools.onDomReady( () => startTask() )

        })

    }

    // ready for beta
    async launchAutoXScroll (reload) {

        return this.data.automatisms.autoHorizontalScrolling = await new Promise( resolve => {

            let startTask = async ( tools = this.#tools, result = [] ) => {

                let scrollCtrl = ( el ) => {

                    result.push(el)

                    let cursor = 0,
                        realwidth = 0


                    window.addEventListener( 'resize', () =>{ 
                        realwidth=0
                        Array.from(el.children).forEach( child => realwidth += child.offsetWidth )
                    }); Array.from(el.children).forEach( child => realwidth += child.offsetWidth )


                    el.onwheel = eventHorizontalScroll => {

                        if(realwidth>el.clientWidth){

                            eventHorizontalScroll.preventDefault()

                            if( cursor <= -1 )
                                cursor = 0

                            if(cursor >= realwidth)
                                cursor = realwidth-1

                            if( cursor > -1 && cursor < realwidth )
                                cursor += eventHorizontalScroll.deltaY

                            el.scrollTo( { left:cursor, top:0, behavior: 'smooth' } )

                            eventHorizontalScroll = null

                        }

                    }

                }

                document.querySelectorAll('div,span,.scroll-x>*,.box-flow.dir-x.type-unwrap').forEach( el => {
                    if( el.classList.contains('.box-flow.dir-x.type-unwrap') || el.classList.contains('scroll-x') || window.getComputedStyle(el).getPropertyValue("overflow-x")=='scroll' )
                    scrollCtrl ( el )
                })

                resolve(result)

            }

            !! reload ? startTask() : this.#tools.onDomReady( () => startTask() )

        })

    }

    // ready for beta
    async launchPopups (reload) {

        return this.data.controllers.popups = await new Promise( resolve => {

            let startTask = async ( tools = this.#tools, result = [] ) => {

                document.querySelectorAll('[target^="open#"]').forEach( el =>{

                    let dc = {/*dataCollection*/}

                    dc.trigger = el
                    
                    if( dc.popupName = dc.trigger.getAttribute('target').split('open#')[1] ) {
                        
                        if ( dc.popup = document.getElementById ( dc.popupName ) ) {

                            dc.trigger.onclick = () => { openpopup (dc,false) } 
            
                            function openpopup (dc,backToOwner) {

                                if ( dc.popup.dataset.status != 'active' ) {

                                    document.body.classList.add('pushing-effects')

                                    document.querySelectorAll('.overlay')[0] ? null : document.body.insertAdjacentHTML('beforeEnd','<div class="overlay"><!--empty html box--></div>')
                                    dc.overlay = document.querySelectorAll('.overlay')[0]
                                    dc.overlay.dataset.status='active'

                                    setTimeout(()=>{

                                        // save positions
                                        let basedir = ['left','top','center','right','bottom']
                                        
                                        // get the direction of pane
                                        dc.dir = basedir.filter( d => dc.popup.classList.contains(d) )[0]
                                        dc.dir ? null : console.error(`⚠ [ ui alert ] ➔ Internal error on popups controller\n  ⮑ unsupprted pop direction (left | top | center | right | bottom) on:`,dc.trigger,dc.popup)

                                        // check if you clicked a nested with wrong dir
                                        if ( dc.trigger.closest('.box-popup') ) {

                                            dc.ownerPopup  = dc.trigger.closest('.box-popup')
                                            dc.ownerDir    = basedir.filter( d => dc.ownerPopup.classList.contains(d) )[0]
                                            dc.goback      = dc.popup.querySelectorAll('.goback')[0]

                                            if ( dc.ownerDir != dc.dir ) {

                                                dc.popup.parentElement.closest('.box-popup')
                                                ? console.error(`⚠ [ ui alert ] ➔ Internal error on popups controller\n  ⮑ differents direction but same nested content container on:`,dc.ownerPopup,dc.popup)
                                                : dc.ownerPopup.dataset.status='off'

                                                // kill the only popup panel  in multipane
                                                if( dc.goback ) dc.goback.addEventListener( 'click', ()=>{ 
                                                    closepopup (dc)
                                                    openpopup (dc,true)
                                                })
                                            
                                            } else {

                                                // kill the only popup panel  in multipane
                                                if( dc.goback ) dc.goback.addEventListener( 'click', ()=>{ 
                                                    dc.goback.closest('.box-popup').dataset.status='off' 
                                                })
                                            
                                            }

                                        }

                                        // open all
                                        document.body.classList.remove('[class*=pushing-]:not(.pushing-effects)')
                                        dc.overlay.dataset.status='active'

                                        if(!! backToOwner)
                                            document.body.classList.add('pushing-'+dc.ownerDir),
                                            dc.overlay.classList.add(dc.ownerDir),
                                            dc.ownerPopup.dataset.status='active'
                                        else
                                            document.body.classList.add('pushing-'+dc.dir),
                                            dc.overlay.classList.add(dc.dir),
                                            dc.popup.dataset.status='active'
    
                                        dc.status = 'active'

                                        // close all of popup

                                        if(close = dc.popup.querySelectorAll('.close')[0])
                                            close.addEventListener( 'click', ()=>{  closepopup (dc) })

                                        dc.overlay.addEventListener( 'click', ()=>{ closepopup (dc) })

                                    
                                    },10)

                                }

                            }

                            function closepopup (dc) {

                                document.body.classList.remove('pushing-'+dc.dir)
                                document.body.classList.remove('pushing-'+dc.ownerDir)

                                dc.popup.dataset.status='off'
                                dc.overlay.dataset.status='off'

                                setTimeout(()=>{

                                    dc.overlay.classList.remove(dc.dir)
                                    dc.overlay.classList.remove(dc.ownerDir)
                                    document.body.classList.remove('pushing-effects')
                                    if(document.body.classList.length<=0)document.body.removeAttribute('class')
                                    dc.popup.removeAttribute('data-status')

                                    dc.status = 'off'

                                },300)

                            }

                            result.push(dc)


                        } else console.error(`⚠ [ ui alert ] ➔ Internal error on popups controller\n  ⮑ unfinded target with value "`+dc.trigger.getAttribute('target').split('open#')[1]+`" on :`,dc.trigger)

                    } else console.error(`⚠ [ ui alert ] ➔ Internal error on popups controller\n  ⮑ unreadable target value "`+dc.trigger.getAttribute('target')+`" on :`,dc.trigger) 

                })

                resolve(result)

            }

            !! reload ? startTask() : this.#tools.onDomReady( () => startTask() )

        })

    }

    // ready for beta
    async launchTooltips (reload) {

        return this.data.controllers.tooltips = await new Promise( resolve => {

            let startTask = async ( tools = this.#tools, result = [] ) => {

                let elList = document.querySelectorAll(".tip")

                window.addEventListener( 'click', () => closealltips(elList) )

                elList.forEach( el => {

                    let dc = {/*dataCollection*/}

                    dc.trigger = el
                    dc.contents = el.innerHTML
                    dc.status = 'off'

                    el.dataset.status = 'off'

                    if( el.parentNode.tagName.toLowerCase() == 'p' ) {

                        if('ontouchstart' in window)
                            el.ontouchstart = () => toggletips(elList,el,dc)

                        else
                            el.onmouseenter = () => toggletips(elList,el,dc),
                            el.onmouseleave = () => closealltips(elList)

                    } 

                    el.onclick = () => toggletips(elList,el,dc)

                    result.push(dc)

                })

                function toggletips (elList,el,dc) {

                    setTimeout(()=>{ 
                        closealltips(elList)
                        el.dataset.status = 'active'
                        dc.status =  'active'
                    },150)

                }

                function closealltips (elList) {

                    for (let el of elList)
                    el.dataset.status = 'off'

                    for (let dataelement of result)
                    dataelement.status =  'off'

                }

                resolve(result)

            }

            !! reload ? startTask() : this.#tools.onDomReady( () => startTask() )

        })

    }

    /* --- */

    // ready for beta
    async launchSelectbox (reload) {

        return this.data.buttons.select = await new Promise( resolve => {

            let startTask = async ( tools = this.#tools, result = [] ) => {

                document.querySelectorAll('.button.type-select').forEach( el =>{

                    let dc = {/*dataCollection*/}

                    dc.main = el

                    dc.label  = el.getElementsByTagName('label')[0]
                    
                    dc.inputs = {
                        'main'   : el.querySelectorAll('input')[0],
                        'select' : el.getElementsByTagName('select')[0],
                        'search' : el.querySelectorAll('[type=search]')[0]
                    }
                    
                    dc.isMultiple = dc.inputs.main.multiple ? 1 : 0

                    dc.exvalues = dc.inputs.main.value.split(',') || document.getElementsByTagName('select')[0].value.split(','),
                    dc.values   = dc.exvalues


                    // make and set popup
                    if( dc.inputs.select ) {

                        //get from or generate a random id from 0 to 1000
                        let SELECTID =  el.getAttribute('id') ?
                                            'select-'+el.getAttribute('id') :
                                        dc.inputs.select.getAttribute('id') ?
                                            'select-'+dc.inputs.select.getAttribute('id') :
                                            'select-'+ ~~ (Math.random() * 9999)

                        dc.targetId = SELECTID

                        //set target of off canvas
                        el.setAttribute('target','open#'+SELECTID)

                        //generate the empty output

                        let searchbar = dc.inputs.search ? `<div class=button></div>` : ``

                        let selectEmptyPopup =
                            `
                                <div class="box-popup center" id="`+SELECTID+`">
                                    <div class="selectorbox">

                                        <div>
                                            <p>`+tools.printl("Select an option")+`</p>
                                        </div>

                                        <div>
                                            `+ searchbar + `
                                        </div>

                                        <div class="scroll-y no-scrollbar">
                                            <div class="optiongroup">
                                            </div>
                                        </div>

                                        <div>
                                            <div class="button text-center">
                                                <a class="close" disabled>`+tools.printl("Close")+`</a>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            `


                        //print empty output & get it
                        document.getElementsByTagName('BODY')[0].insertAdjacentHTML('beforeEnd',selectEmptyPopup)

                        // setTimeout(()=>{

                            //get/update elements
                            dc.popup         = document.querySelectorAll('#'+SELECTID+' .optiongroup')[0]
                            dc.selectorbox   = document.querySelectorAll('#'+SELECTID+' .selectorbox')[0]
                            dc.accept         = document.querySelectorAll('#'+SELECTID+' .close')[0]

                            //get options groups value...
                            el.querySelectorAll('OPTGROUP').forEach( Group =>{

                                // create a options list
                                let optslist = []

                                Group.querySelectorAll('option').forEach( option =>{

                                    if(dc.isMultiple) {

                                        let included = dc.exvalues.includes( String(option.value) ),
                                            ischeck = included ? 'checked="true"' : '',
                                            istrue  = included ? 1 : 0

                                        let check_html =
                                        `
                                            <div class="button type-checkbox" data-option="`+option.value+`">
                                                <input type="checkbox" name="options"  value="`+istrue+`" `+ischeck+` />
                                                <label>`+option.text+`</label>
                                            </div>
                                        `

                                        optslist.push(check_html)

                                    } else {

                                        optslist.push('<a data-option="'+option.value+'">'+option.text+'</a>')

                                    }

                                })


                                let optionslist = optslist.join(' ')

                                let Labels = ! Group.getAttribute('label') ? false : '<p>'+Group.getAttribute('label')+'</p>';

                                // print new output contents
                                let output = ! Labels
                                    ? `
                                        <div class="nolabel hide"></div>
                                        <div class="options">
                                        `+optionslist+`
                                        </div>
                                    `:`
                                        <div class="label">
                                            `+Labels+`
                                        </div>
                                        <div class="options">
                                            `+optionslist+`
                                        </div>
                                    `

                                dc.popup.insertAdjacentHTML('beforeEnd',output)

                            })


                            dc.accept.innerHTML = "wainting a choose"


                            let AllVoice  = dc.selectorbox.querySelectorAll('.options>*'),
                                vlength   = AllVoice.length,
                                valuelist = [],
                                textslist = [],
                                active

                            dc.options = [] 

                            for (let v = 0; v < vlength; v++) {

                                let voice = AllVoice[v]

                                dc.options.push([voice,voice.innerText,voice.dataset.option])

                                if(dc.isMultiple) {

                                    if( voice.firstElementChild.value==1 || voice.firstElementChild.checked==true )
                                        valuelist.push(voice.getAttribute('data-option')),
                                        textslist.push(voice.getElementsByTagName('label')[0].innerText)

                                    else if(v>=vlength-1)
                                        dc.inputs.main.value = valuelist.join(),
                                        dc.label.innerHTML   = textslist.join()

                                } else {

                                    if(voice.innerText == dc.label.innerText) 
                                    voice.dataset.status='active'

                                }

                            }


                            for (let v = 0; v < vlength; v++) {

                                AllVoice[v].addEventListener( 'click', () =>{

                                    settingValues(AllVoice,AllVoice[v],valuelist,textslist)

                                },true)

                            }


                            function settingValues (AllVoice,clicked,valuelist,textslist) {

                                if(dc.isMultiple) {

                                    let valuedata  = clicked.getAttribute('data-option'),
                                        valuelabel = clicked.getElementsByTagName('label')[0].innerText,
                                        indexdata  = valuelist.indexOf(valuedata),
                                        indexlabel = textslist.indexOf(valuelabel)

                                    if(clicked.dataset.status=='active' || clicked.firstElementChild.value==0 || clicked.firstElementChild.checked==false)
                                        clicked.dataset.status='off',
                                        valuelist.push(valuedata),
                                        textslist.push(valuelabel)

                                    else if(!clicked.dataset.status=='active' || clicked.firstElementChild.value==1 || clicked.firstElementChild.checked==true)
                                        clicked.dataset.status='active',
                                        valuelist.splice(indexdata, 1),
                                        textslist.splice(indexlabel, 1)

                                        
                                    if(valuelist.length>0)
                                        dc.accept.innerHTML = tools.printl("Accept"),
                                        dc.accept.removeAttribute('disabled')
                                    else 
                                        dc.accept.innerHTML = tools.printl("wainting a choose"),
                                        dc.accept.setAttribute('disabled',true) 

                                } else {

                                    for (let t = 0; t < AllVoice.length; t++)
                                    AllVoice[t].dataset.status='off'

                                    clicked.dataset.status='active'
                                    active = clicked

                                    dc.accept.innerHTML = tools.printl("Accept")
                                    dc.accept.removeAttribute('disabled')

                                }

                            }


                            dc.accept.addEventListener ( 'click', () =>{ 

                                printValues (dc,valuelist,textslist,active)

                            })

                            function printValues (dc,valuelist,textslist,active) {

                                if(dc.isMultiple)
                                    dc.inputs.main.value = valuelist.join(),
                                    dc.label.innerHTML   = textslist.join(),
                                    dc.values = dc.inputs.main.value

                                else
                                    dc.label.innerText   = active.innerText,
                                    dc.inputs.main.value = active.dataset.option,
                                    dc.values = dc.inputs.main.value

                                // setTimeout(()=>{ close.innerHTML = "CLOSE" },300)

                            }


                            // if have a search

                            if ( dc.inputs.search ) {

                                //move searcher
                                dc.selectorbox.querySelectorAll('.button')[0].appendChild(dc.inputs.search)
                                dc.inputs.search = dc.selectorbox.querySelectorAll('input[type=search]')[0]

                                dc.inputs.search.addEventListener('input', () => {

                                    let searched = dc.inputs.search.value.toLowerCase()

                                    for (let v = 0; v < vlength; v++)
                                        ! AllVoice[v].innerText.toLowerCase().startsWith(searched)
                                            ? AllVoice[v].classList.add('hide')
                                            : AllVoice[v].classList.remove('hide')

                                    for (let v = 0; v < vlength; v++) {

                                        let voiceparent = AllVoice[v].parentNode,
                                            parentLabel = voiceparent.previousElementSibling

                                        if(parentLabel.classList.contains('label'))
                                            voiceparent.childElementCount == voiceparent.querySelectorAll(".hide").length
                                                ? parentLabel.classList.add('hide')
                                                : parentLabel.classList.remove('hide')

                                    }

                                })


                                

                            }


                        // },200)

                    }

                    result.push(dc)
                    
                })

                this.launchPopups(true)
                this.launchCheckbox(true)

                this.#tools.onDomCompleted( () =>{
                    if(document.readyState=='complete') { 
                        document.querySelectorAll('.button.type-select').forEach( el =>{
                            el.getElementsByTagName('select')[0].remove()
                        })
                    }
                })

                resolve(result)

            }

            !! reload ? startTask() : this.#tools.onDomReady( () => startTask() )

        })

    }

    // ready for beta
    async launchDropdown (reload) {

        return this.data.buttons.dropdown = await new Promise( resolve => {

            let startTask = async ( tools = this.#tools, result = [] ) => {

                document.querySelectorAll('.button.type-dropdown').forEach( el =>{

                    let dc = {/*dataCollection*/}
            
                    dc.main = el

                    dc.label  = el.getElementsByTagName('label')[0]
        
                    dc.inputs = {
                        'main'   : el.querySelectorAll('input')[0],
                        'select' : el.getElementsByTagName('select')[0],
                        'search' : el.querySelectorAll('[type=search]')[0]
                    }

                    dc.isMultiple = dc.inputs.main.multiple ? 1 : 0

                    dc.exvalues = dc.inputs.main.value.split(',') || document.getElementsByTagName('select')[0].value.split(','),
                    dc.values   = dc.exvalues


                    // make and set popup

                    if( dc.inputs.select ) {

                        //generate the empty output
                        let selectEmptyPopup = 
                            dc.inputs.search ?
                            `
                                <div class="selectorbox" data-status="off">

                                    <div>
                                        <div class=button></div>
                                    </div>

                                    <div class="scroll-y no-scrollbar">
                                        <div class="optiongroup"></div>
                                    </div>

                                </div>
                            `:`
                                <div class="selectorbox" data-status="off">
                                    <div class="scroll-y no-scrollbar">
                                        <div class="optiongroup">
                                        </div>
                                    </div>
                                </div>
                            `

                        //print empty output & get it
                        el.insertAdjacentHTML('beforeEnd',selectEmptyPopup)
                        
                        // setTimeout(()=>{

                            //get/update elements
                            dc.selectorbox = el.querySelectorAll('.selectorbox')[0]

                            //get options groups value...
                            el.querySelectorAll('OPTGROUP').forEach( group =>{


                                // create a options list
                                let optslist = []

                                group.querySelectorAll('option').forEach( option =>{

                                    if (dc.isMultiple) {

                                        let included = dc.exvalues.includes(String(option.value)),
                                            ischeck  = included ? 'checked="true"' : '',
                                            istrue   = included ? 1 : 0;

                                        let check_html =
                                        `
                                            <div class="button type-checkbox" data-option="`+option.value+`">
                                                <input type="checkbox" value="`+istrue+`" `+ischeck+` />
                                                <label>`+option.text+`</label>
                                            </div>
                                        `

                                        optslist.push(check_html)

                                    }

                                    else {

                                        optslist.push('<a data-option="'+option.value+'">'+option.text+'</a>')

                                    }

                                })

                                let optionslist = optslist.join(' ')

                                let Labels = ! group.getAttribute('label') ? false : '<p>'+group.getAttribute('label')+'</p>';

                                let output = ! Labels
                                    ? `
                                        <div class="nolabel hide"></div>
                                        <div class="options">
                                        `+optionslist+`
                                        </div>
                                    `:`
                                        <div class="label">
                                            `+Labels+`
                                        </div>
                                        <div class="options">
                                            `+optionslist+`
                                        </div>
                                    `

                                // print new output contents
                                dc.selectorbox.querySelectorAll('.optiongroup')[ 0 ].insertAdjacentHTML('beforeEnd', output)

                            })

                            if(dc.isMultiple)
                                dc.selectorbox.classList.add('multiple')


                            setTimeout(()=>{
                                dc.selectorbox.style.width = el.offsetWidth+'px';
                            },150)


                            document.addEventListener( 'click', event => {

                                ! el.contains(event.target) || !event.target.parentElement.classList.contains('type-checkbox') && event.target.tagName.toLowerCase()=='label' && dc.selectorbox.dataset.status=='active'
                                    ? dc.selectorbox.dataset.status='off'
                                    : dc.selectorbox.dataset.status='active'

                            })


                            //on click into voice of relative select popup or searcher change


                            let AllVoice  = dc.selectorbox.querySelectorAll('.options>*'),
                                vlength   = AllVoice.length,
                                valuelist = [],
                                textslist = []


                            for (let v = 0; v < vlength; v++) {

                                let voice = AllVoice[v]

                                if(dc.isMultiple) {

                                    if( voice.firstElementChild.value==1 || voice.firstElementChild.checked==true )
                                        valuelist.push(voice.getAttribute('data-option')),
                                        textslist.push(voice.getElementsByTagName('label')[0].innerText)

                                    else if(v>=vlength-1)
                                        dc.inputs.main.value     = valuelist.join(),
                                        dc.label.innerHTML = textslist.join()

                                } else {

                                    if(voice.innerText == dc.label.innerText)
                                        voice.dataset.status='active'

                                }

                            }


                            for (let v = 0; v < vlength; v++) {

                                AllVoice[v].addEventListener('click', () =>{

                                    printValues(dc,AllVoice,AllVoice[v],valuelist,textslist)

                                },false)

                            }


                            function printValues (dc,AllVoice,clicked,valuelist,textslist) {

                                if(dc.isMultiple) {

                                    let valuedata  = clicked.getAttribute('data-option'),
                                        valuelabel = clicked.getElementsByTagName('label')[0].innerText,
                                        indexdata  = valuelist.indexOf(valuedata),
                                        indexlabel = textslist.indexOf(valuelabel)

                                    if(clicked.classList.contains('active') || clicked.firstElementChild.value==0 || clicked.firstElementChild.checked==false)

                                        clicked.dataset.status='off',
                                        valuelist.push(valuedata),
                                        textslist.push(valuelabel)

                                    else if(!clicked.classList.contains('active') || clicked.firstElementChild.value==1 || clicked.firstElementChild.checked==true)

                                        clicked.dataset.status='active',
                                        valuelist.splice(indexdata, 1),
                                        textslist.splice(indexlabel, 1)
                

                                    dc.inputs.main.value = valuelist.join()
                                    dc.label.innerHTML   = textslist.join()

                                    dc.values = dc.inputs.main.value


                                } else {

                                    for (let t = 0; t < AllVoice.length; t++)
                                    AllVoice[t].dataset.status='off'

                                    clicked.dataset.status='active',
                                    dc.label.innerText = clicked.innerText,
                                    dc.inputs.main.value = clicked.dataset.option

                                    dc.values = clicked.dataset.option

                                }

                            }


                            //if have a search

                            if(dc.inputs.search) {

                                //move searcher
                                dc.selectorbox.querySelectorAll('.button')[0].appendChild(dc.inputs.search)
                                dc.inputs.search = dc.selectorbox.querySelectorAll('input[type=search]')[0]

                                dc.inputs.search.addEventListener( 'input', () => {

                                    let searched = dc.inputs.search.value.toLowerCase()

                                    for (let v = 0; v < vlength; v++)
                                        !AllVoice[v].innerText.toLowerCase().startsWith(searched)
                                            ? AllVoice[v].classList.add('hide')
                                            : AllVoice[v].classList.remove('hide')

                                    for (let v = 0; v < vlength; v++) {

                                        let voiceparent = AllVoice[v].parentNode,
                                            parentLabel = voiceparent.previousElementSibling;

                                        if(parentLabel.classList.contains('label')){

                                            voiceparent.childElementCount == voiceparent.querySelectorAll(".hide").length
                                                ? parentLabel.classList.add('hide')
                                                : parentLabel.classList.remove('hide')
                                        }

                                    }

                                })

                            }

                            //on resize...

                            window.addEventListener( 'resize', () =>{ dc.selectorbox.style.width = el.offsetWidth+'px' })

                        // },100)

                    }

                    result.push(dc)

                })

                this.launchPopups(true)
                this.launchCheckbox(true)

                this.#tools.onDomCompleted( () =>{
                    if(document.readyState=='complete') { 
                        document.querySelectorAll('.button.type-dropdown').forEach( el =>{
                            el.getElementsByTagName('select')[0].remove()
                        })
                    }
                })

                resolve(result)

            }

            !! reload ? startTask() : this.#tools.onDomReady( () => startTask() )

        })

    }

    // ready for beta
    async launchCheckbox (reload) {

        return this.data.buttons.checkbox = await new Promise( resolve => {

            let startTask = async ( tools = this.#tools, result = [] ) => {

                document.querySelectorAll('.button.type-checkbox').forEach( el =>{ 

                    let dc = {/*dataCollection*/}

                    dc.main = el

                    dc.buttonInput = el.firstElementChild

                    let inputtag = dc.buttonInput

                    //if is empty = uncheck
                    if ( !inputtag.checked || inputtag.value=='' )

                        inputtag.removeAttribute('checked'),
                        inputtag.setAttribute('value', 0 ),
                        dc.status = false
        
                    else
        
                        inputtag.setAttribute('checked', true),
                        inputtag.setAttribute('value', 1 ),
                        dc.status = true
            

                    el.onclick = () => {

                        let inputtag = el.firstElementChild
        
                        if(!inputtag.disabled) {
        
                            if( inputtag.checked || inputtag.value == 1 )
                                inputtag.removeAttribute('checked'),
                                inputtag.setAttribute('value', 0 ),
                                dc.status = false
        
                            else
                                inputtag.setAttribute('checked',true),
                                inputtag.setAttribute('value', 1 ),
                                dc.status = true
                        }
        
                    }

                    result.push(dc)

                })

                resolve(result)

            }

            !! reload ? startTask() : this.#tools.onDomReady( () => startTask() ) 

        })

    }

    // ready for beta
    async launchRadiobox (reload) {

        return this.data.buttons.radio = await new Promise( resolve => {

            let startTask = async ( tools = this.#tools, result = [] ) => {

                document.querySelectorAll('.button.type-radio').forEach( el =>{
                    
                    let dc = {/*dataCollection*/}

                    dc.main = el
                    
                    let inputtag = dc.buttonInput = el.firstElementChild

                    dc.buttonContext = dc.buttonInput.name
                    
                    //if is empty = uncheck
                    if(!inputtag.checked || inputtag.value=='')
                        inputtag.removeAttribute('checked'),
                        inputtag.setAttribute('value', 0 ),
                        dc.status = false
        
                    else    
                        inputtag.setAttribute('checked', true),
                        inputtag.setAttribute('value', 1 ),
                        dc.status = false
            

                    el.onclick = () => {

                        let inpgroup = document.querySelectorAll('[name="'+inputtag.getAttribute('name')+'"]')

                        for (let i = 0; i < inpgroup.length; i++)
                            inpgroup[i].removeAttribute('checked'),
                            inpgroup[i].setAttribute('value', 0 ),
                            dc.status = false

                        inputtag.setAttribute('checked', true),
                        inputtag.setAttribute('value', 1 ),
                        dc.status = false

                    }

                    result.push(dc)

                })

                resolve(result)

            }
            
            !! reload ? startTask() : this.#tools.onDomReady( () => startTask() )

        })

    }

    // ready for beta
    async launchPassword (reload) {

        return this.data.buttons.password = await new Promise( resolve => {

            let startTask = async ( tools = this.#tools, result = [] ) => {
                    
                function passValidation(dc,pass){

                    let errors = [],
                        vulnerability = 1

                    if(pass){

                        if(/[^a-zA-Z0-9!@#$%^&*_.]/.test(pass)) {

                            vulnerability = 5
                            errors.push( tools.printl('Your password contains wrong charater. The valid characters are ') + "a-z , A-Z , 0-9 " + tools.printl('and symbols')+": !@#$%^&*_." )

                        } else {

                            if(pass.length<8 || pass.length<20)
                                vulnerability++,
                                pass.length<8 ? 
                                    errors.push(tools.printl("Your password must be at least 8 characters. Characters quantity")+": "+pass.length) :
                                    errors.push(tools.printl("Your password exceeds a maximum of 20 characters. Characters quantity")+": "+pass.length)

                            if(pass.search(/[a-z]/i) < 0) 
                                vulnerability++,
                                errors.push(tools.printl("Your password must contain at least one letter"))
                            
                            if(pass.search(/[A-Z]/) < 0) 
                                vulnerability++,
                                errors.push(tools.printl("Your password must contain a uppercase one letter"))
                            
                            if(pass.search(/[!@#$%^&*-_.]/i))
                                vulnerability++,
                                errors.push(tools.printl("Your password must contain a valid symbol")+" (!@#$%^&*-_.).")

                            if(pass.search(/[0-9]/i) < 0)
                                vulnerability++,
                                errors.push(tools.printl("Your password must contain a number"))

                        }

                    } else {

                        vulnerability = 5
                        errors.push(tools.printl("Your password is empty")+".")

                    }

                    dc.vulnerability = Number(vulnerability)
                    dc.errors = errors

                }

                document.querySelectorAll('.button.type-password').forEach( el =>{

                    let dc = {/*dataCollection*/}

                    dc.main = el

                    dc.icons = {
                        'text':el.getElementsByTagName('img')[0],
                        'pass':el.getElementsByTagName('img')[1]
                    }

                    dc.inputs = {
                        'text': el.getElementsByTagName('input')[0],
                        'pass': el.getElementsByTagName('input')[1]
                    }

                    dc.icons.text.dataset.status='active'
                    dc.icons.pass.dataset.status='off'
                    dc.inputs.text.dataset.status='off'
                    dc.inputs.pass.dataset.status='active'

                    passValidation(dc,dc.inputs.text.value)

                    dc.visibility = dc.inputs.text.dataset.status!='active' ? false : true 

                    dc.inputs.pass.setAttribute('value',dc.inputs.text.value)

                    dc.icons.text.addEventListener( 'click', () => {

                        dc.icons.text.dataset.status='off'
                        dc.icons.pass.dataset.status='active'
                        dc.inputs.text.dataset.status='active'
                        dc.inputs.pass.dataset.status='off'

                        dc.visibility = dc.inputs.text.dataset.status!='active' ? false : true 

                    })

                    dc.icons.pass.addEventListener( 'click', () => {

                        dc.icons.text.dataset.status='active'
                        dc.icons.pass.dataset.status='off'
                        dc.inputs.text.dataset.status='off'
                        dc.inputs.pass.dataset.status='active'

                        dc.visibility = dc.inputs.text.dataset.status!='active' ? false : true 

                    })



                    let runUpdate = () =>  {
    
                        let inputObserver = setInterval(()=>{

                            let valuestring = el.querySelectorAll('input[data-status=active]')[0].value
                            dc.inputs.text.value = valuestring
                            dc.inputs.pass.value = valuestring

                            dc.length = valuestring.length

                            passValidation(dc,dc.inputs.text.value)

                        }, 50)

                        el.addEventListener( 'blur', () => {
                            window.clearInterval(inputObserver)
                        }, true)

                    }

                    el.addEventListener( 'focus', runUpdate, true )

                    result.push(dc)

                })

                resolve(result)

            }
            
            !! reload ? startTask() : this.#tools.onDomReady( () => startTask() )

        })

    }

    // ready for beta
    async launchRating (reload) {

        return this.data.buttons.rating = await new Promise( resolve => {

            let startTask = async ( tools = this.#tools, result = [] ) => {
                    
                document.querySelectorAll('.button.type-rating').forEach( el =>{

                    let dc = {/*dataCollection*/}

                    dc.main = el
                    dc.starsContainer = el.querySelectorAll('.stars')[0]
                    dc.ratingActual   = el.previousElementSibling.value
                    dc.labels = [
                        tools.printl('very bad'),
                        tools.printl('not good'),
                        tools.printl('normal/good'),
                        tools.printl('very good'),
                        tools.printl('exellent')
                    ]

                    let htmlOutput,
                        allstarsbox,
                        alllabelbox

                    // set to start

                    htmlOutput = `<span class="all-stars"></span><span class="all-labels"></span>`
                    dc.starsContainer.innerHTML = htmlOutput

                    allstarsbox = el.querySelectorAll('.all-stars')[0]

                    for (let s = 0; s < 5; s++)
                        htmlOutput = `<svg data-rating="`+(s+1)+`"><path d="M12.6504 17.8019L18.8304 21.5319L17.1904 14.5019L22.6504 9.77186L15.4604 9.16186L12.6504 2.53186L9.84039 9.16186L2.65039 9.77186L8.11039 14.5019L6.47039 21.5319L12.6504 17.8019Z"/></svg>`,
                        allstarsbox.innerHTML += htmlOutput


                    alllabelbox = el.querySelectorAll('.all-labels')[0]

                    for (let l = 0; l < 5; l++)
                        htmlOutput = `<p class="`+(l==dc.ratingActual ? "show" : "hide")+`">`+dc.labels[l]+`</p>`,
                        alllabelbox.innerHTML += htmlOutput


                    let allstars = allstarsbox.getElementsByTagName('svg'),
                        alllabel = alllabelbox.getElementsByTagName('p')


                    // reset active

                    for (let s = 0; s < 5; s++)
                        allstars[s].dataset.status='off'


                    for (let s = 0; s < 5; s++)
                        dc.ratingActual == allstars[s].dataset.rating ?
                                            allstars[s].dataset.status='active' :
                                            null

                    for (let s = 0; s < 5; s++) {

                        let star = allstars[s]

                        // set to hover
                        star.onmouseover = () => {

                            for (let t = 0; t < 5; t++) {

                                (t<=s)
                                    ? allstars[t].classList.add('focus')
                                    : allstars[t].classList.remove('focus');

                                (t==s)
                                    ? alllabel[t].classList.replace('hide','show')
                                    : alllabel[t].classList.replace('show','hide');
                            }

                        }


                        // reset on blur
                        star.onmouseleave = () => {

                            for (let t = 0; t < 5; t++)
                                allstars[t].classList.remove('focus'),
                                alllabel[t].classList.replace('show','hide')

                            for (let t = 0; t < 5; t++)
                                allstars[t].dataset.status=='active'
                                    ? alllabel[t].classList.replace('hide','show')
                                    : null 

                        }

                        // set to click
                        star.onclick = () => {

                            // reset active
                            for (let t = 0; t < 5; t++)
                                allstars[t].dataset.status='off',
                                alllabel[t].classList.replace('show','hide')

                            // make active
                            el.setAttribute('data-stars', star.dataset.rating)
                            alllabel[s].classList.replace('hide','show')
                            star.dataset.status='active'

                            if(el.previousElementSibling.tagName == 'INPUT')
                                el.previousElementSibling.value = star.dataset.rating,
                                el.previousElementSibling.setAttribute('value',star.dataset.rating)

                            dc.ratingActual = star.dataset.rating

                        }

                    }

                    result.push(dc)

                })

                resolve(result)

            }
            
            !! reload ? startTask() : this.#tools.onDomReady( () => startTask() )

        })

    }

    // ready for beta
    async launchNumbers (reload) {

        return this.data.buttons.number = await new Promise( resolve => {

            let startTask = async ( tools = this.#tools, result = [] ) => {

                document.querySelectorAll('.button.type-number').forEach( el =>{

                    let dc = {/*dataCollection*/}

                    dc.main = el

                    // get input values

                    let taginput = el.querySelectorAll('input[type="number"]')[0],
                        val      = dc.value = taginput.getAttribute('value'),
                        min      = dc.min   = taginput.getAttribute('min'),
                        max      = dc.max   = taginput.getAttribute('max')


                    // build the numbers into cage

                    el.insertAdjacentHTML('beforeEnd','<div class="number-slider"></div>')

                    let slide = el.querySelectorAll('.number-slider')[0]

                    for (let i = min; i <= max; i++)
                        slide.insertAdjacentHTML('beforeEnd',`<span class="number-[`+i+`]" data-status='off'>`+i+`</span>`)


                    //set active by input

                    slide.querySelectorAll('[class*="number-['+val+']"]')[0].dataset.status='active'
                    dc.active = slide.querySelectorAll('[class*="number-['+val+']"]')[0]
                    dc.value = taginput.value


                    //slide to start

                    function refreshActivation() {

                        setTimeout(()=>{

                            let numberactive   = slide.querySelectorAll('.number-slider [data-status=active]')[0],
                                activeposition = ((numberactive.offsetLeft+(numberactive.offsetWidth/2))-(el.offsetWidth/2))

                            slide.style.transform = 'translateX('+( activeposition*-1 )+'px)'

                        },200)

                    }

                    refreshActivation()

                    // on drag it

                    'ontouchstart' in window
                        ? slide.addEventListener( 'touchstart', dragStart )
                        : slide.addEventListener( 'mousedown', dragStart )


                    let startX, dirX;

                    function dragStart(event) {

                        event = event || window.event
                        event.preventDefault()

                        let actualposition = slide.style.transform.replace(/[^\d.]/g, '')*-1;

                        slide.dataset.status='active'

                        startX  = 'ontouchstart' in window
                                ? event.touches[0].clientX - actualposition
                                : event.clientX - actualposition

                        if( 'ontouchstart' in window )
                            document.addEventListener( 'touchmove', dragMove ),
                            document.addEventListener( 'touchend', dragEnd )
                        else
                            document.addEventListener( 'mousemove', dragMove ),
                            document.addEventListener( 'mouseUp', dragEnd )
        

                    }

                    function dragMove(event) {

                        event = event || window.event
                        event.preventDefault()

                        dirX    = 'ontouchstart' in window
                                ? event.touches[0].clientX - startX
                                : event.clientX - startX

                        slide.style.transform = "translateX("+dirX+"px)"

                        'ontouchstart' in window
                            ? document.addEventListener( 'touchend', dragEnd  )
                            : document.addEventListener( 'mouseup', dragEnd  )

                        checkactive()

                    }

                    function dragEnd(event) {

                        event = event || window.event
                        event.preventDefault()

                        slide.dataset.status='off'

                        startX = dirX*-1

                        // let startvalueposition = startX*-1

                        let actualposition = slide.style.transform.replace(/[^\d.]/g, '')*-1;
                        
                        let active = slide.querySelectorAll('.number-slider [data-status=active]')[0],
                            activepos = (active.offsetLeft+active.offsetWidth/2)-el.offsetWidth/2;

                        slide.style.transitionDuration = '.3s'

                        slide.style.transform = 'translateX('+( activepos*-1 )+'px)' //activepos or correction

                        setTimeout(()=>{
                            slide.style.removeProperty('transition-duration')
                        },300)

                        taginput.setAttribute( 'value', active.innerText )

                        dc.active = active
                        dc.value = taginput.value
                        dc.sliderposition = actualposition

                        if ( 'ontouchstart' in window )
                            document.removeEventListener( 'touchstart', dragMove ),
                            document.removeEventListener( 'touchend', dragEnd )
                        else 
                            document.removeEventListener( 'mousemove', dragMove )
                            document.removeEventListener( 'mouseUp', dragEnd )

                    }

                    function checkactive() {

                        let actualposition = slide.style.transform.replace(/[^\d.]/g, '')

                        //aclual active position
                        let actualactive   = slide.querySelectorAll('.number-slider [data-status=active]')[0],
                            activeposition = (actualactive.offsetLeft+actualactive.offsetWidth/2)-el.offsetWidth/2;

                        if( actualposition > activeposition+actualactive.offsetWidth/2 ) {

                            if(actualactive.nextElementSibling)
                                actualactive.nextElementSibling.dataset.status='active',
                                actualactive.dataset.status='off',
                                actualactive = slide.querySelectorAll('.number-slider [data-status=active]')[0]

                        }

                        else if( actualposition < activeposition-actualactive.offsetWidth/2 ) {

                            if(actualactive.previousElementSibling)
                                actualactive.previousElementSibling.dataset.status='active'
                                actualactive.dataset.status='off'
                                actualactive = slide.querySelectorAll('.number-slider [data-status=active]')[0]

                        }

                        dc.active = actualactive.innerText
                        dc.value = taginput.value
                        dc.sliderposition = actualposition

                    }


                    // on click next/prev

                    dc.prev = el.getElementsByTagName('span')[0]
                    dc.next = el.getElementsByTagName('span')[1]

                    dc.prev.onclick = () => {

                        let exactive  = slide.querySelectorAll('.number-slider [data-status=active]')[0],
                            newactive = exactive.previousElementSibling;
                        movefromon(exactive,newactive);

                    }

                    dc.next.onclick = () => {

                        let exactive  = slide.querySelectorAll('.number-slider [data-status=active]')[0],
                            newactive = exactive.nextElementSibling;
                        movefromon(exactive,newactive);

                    }

                    function movefromon(exactive,newactive) {

                        newactive.dataset.status='active'
                        exactive.dataset.status='off'

                        taginput.setAttribute('value', newactive.innerText )

                        let reposition = ( newactive.offsetLeft+newactive.offsetWidth/2 ) - el.offsetWidth/2

                        slide.style.transitionDuration = '.3s'
                        slide.style.transform = 'translateX('+(reposition*-1)+'px)'

                        setTimeout(()=>{
                            slide.style.removeProperty('transition-duration')
                        },300)

                        dc.active = newactive
                        dc.value = taginput.value
                        dc.sliderposition = reposition*-1

                    }

                    result.push(dc)

                })

                resolve(result)

            }
            
            !! reload ? startTask() : this.#tools.onDomReady( () => startTask() )

        })

    }

    // ready for beta
    async launchRangeSliders (reload) {

        return this.data.buttons.rangeSlider = await new Promise( resolve => {

            let startTask = async ( tools = this.#tools, result = [] ) => {

                document.querySelectorAll('.button.type-range').forEach( el =>{

                    let dc = {/*dataCollection*/}

                    dc.main = el

                    dc.sliders = []

                    let slider    = el.querySelectorAll('.sliders')[0],
                        monitor   = dc.monitor = el.querySelectorAll('.monitor')[0]

                    monitor.dataset.status='off'


                    el.querySelectorAll('input').forEach( (range,i) =>{

                        let rsdc = {/*rangeSliderDataCollection*/}

                        rsdc.slider = slider

                        // start inputs values
                        let min            = rsdc.min = range.getAttribute('min'),
                            max            = rsdc.max = range.getAttribute('max'),
                            val            = rsdc.value = range.getAttribute('value'),
                            containerwidth = range.offsetWidth,
                            bullet         = rsdc.bullet = range.nextElementSibling.nextElementSibling
                            

                        // is it flaot?

                        let type = range.getAttribute('type'),
                            dot = (type.match('float')) ? 2 : 0

                        //get steps (% and not)

                        let isPercent,
                            stepper

                        if( ""+range.step.match('%') )

                            isPercent = 1,
                            stepper = parseFloat(range.step.split('%')[0])

                        else

                            isPercent = 0,
                            stepper = parseFloat(range.step)


                        //Dot on start position

                        let presetdot = GetPercentage(min,max,val)

                        bullet.style.left = presetdot+"%"

                        setLine()


                        // on drag elements

                        'ontouchstart' in window
                            ? bullet.addEventListener( 'touchstart', btnrange_dragStart )
                            : bullet.addEventListener( 'mousedown',  btnrange_dragStart )


                        let startX, dirX;

                        function btnrange_dragStart(event) {

                            event = event || window.event
                            event.preventDefault()

                            containerwidth = range.offsetWidth

                            startX  = 'ontouchstart' in window 
                                    ? event.touches[0].clientX - bullet.offsetLeft
                                    : event.clientX - bullet.offsetLeft

                            bullet.dataset.status='active'

                            if( 'ontouchstart' in window )
                                document.addEventListener( 'touchmove', btnrange_dragMove ),
                                document.addEventListener( 'touchend', btnrange_dragEnd )
                            else
                                document.addEventListener( 'mousemove', btnrange_dragMove ),
                                document.addEventListener( 'mouseup', btnrange_dragEnd )

                        }


                        function btnrange_dragMove(event) {

                            event = event || window.event 
                            event.preventDefault()

                            let prevBullet = el.querySelectorAll('b')[i-1], 
                                prevElemPosition, 
                                prevPercentage

                            if(prevBullet)

                                prevElemPosition = parseInt(prevBullet.offsetLeft),
                                prevPercentage = parseInt(GetPercentage(0,containerwidth,prevElemPosition))

                            else

                                prevPercentage=-1


                            let nextBullet = el.querySelectorAll('b')[i+1],
                                nextElemPosition,
                                nextPercentage

                            if(nextBullet)

                                nextElemPosition = parseInt(nextBullet.offsetLeft),
                                nextPercentage = parseInt(GetPercentage(0,containerwidth,nextElemPosition))
                            
                            else

                                nextPercentage=101


                            dirX = 'ontouchstart' in window
                                ? event.touches[0].clientX - startX
                                : event.clientX - startX


                            if ( dirX > -1 && dirX < containerwidth+1 ) {

                                let bulletpercent, newval;

                                if( !range.step ) {

                                    bulletpercent  = GetPercentage(0,containerwidth,dirX)
                                    newval  = GetVal(min,max,bulletpercent)

                                    rsdc.value = newval

                                    if(bulletpercent > prevPercentage && bulletpercent < nextPercentage)
                                        setdot(bulletpercent,newval)

                                }

                                else {

                                    if( isPercent ) {

                                        let stepcut = Number( (containerwidth*stepper)/100 ).toFixed(dot); //is a step in px of container

                                        let pass = -1; for (let i = min; i < max; i++) {

                                            pass++;

                                            let rangemid = (stepcut*pass);

                                            let rangemin = (rangemid)-(stepcut/2),
                                                rangemax = (rangemid)+(stepcut/2)

                                            if(dirX > rangemin && dirX < rangemax) {

                                                let actualstep = rangemin+(stepcut/2),
                                                    bulletpercent = GetPercentage(0,containerwidth,actualstep),
                                                    newval  = GetVal(min,max,bulletpercent)

                                                rsdc.value = newval

                                                if(bulletpercent > prevPercentage && bulletpercent < nextPercentage)
                                                    setdot(bulletpercent,newval)

                                            }

                                        }

                                    }

                                    else {


                                        bulletpercent  = GetPercentage(0,containerwidth,dirX);
                                        newval  = GetVal(min,max,bulletpercent);


                                        let pass = 0; for (let i = min; i < max; i++) {

                                            pass++;

                                            let valuepass = Number( (min-stepper) + (stepper*pass) )

                                            if(valuepass > max) return false;

                                            let rangemin = (valuepass-(stepper/2)),
                                                rangemax = (valuepass+(stepper/2))

                                            if(newval > rangemin && newval < rangemax) {

                                                range.setAttribute('value', valuepass)
                                                val = range.value

                                                rsdc.value = val

                                                bulletpercent = GetPercentage(min,max,val)

                                                if(bulletpercent > prevPercentage && bulletpercent < nextPercentage)
                                                    setdot(bulletpercent,val)

                                            }

                                        }


                                    }

                                }

                                function setdot(bulletpercent,newval,dot) {

                                    bullet.style.left  = bulletpercent+"%"
                                    monitor.style.left = bulletpercent+"%"

                                    let roundval = Math.ceil(newval);

                                    if(dot<=0)

                                        monitor.innerHTML = '<small>'+roundval+'</small>',
                                        range.setAttribute('value', roundval),
                                        val = range.value

                                    else
                                    
                                        monitor.innerHTML = '<small>'+String(newval)+'</small>',
                                        range.setAttribute('value', newval),
                                        val = range.value


                                    monitor.dataset.status='active'

                                }

                                setLine()

                            }

                        }


                        function btnrange_dragEnd(event) {

                            event = event || window.event
                            event.preventDefault()

                            bullet.dataset.status='off'
                            monitor.dataset.status='off'

                            if( 'ontouchstart' in window )
                                document.removeEventListener( 'touchmove', btnrange_dragMove ),
                                document.addEventListener( 'touchend', btnrange_dragEnd )

                            else
                                document.removeEventListener( 'mousemove', btnrange_dragMove ),
                                document.addEventListener( 'mouseup', btnrange_dragEnd )

                        }


                        //sub functions...

                        function GetPercentage(min,max,position) {
                            return Number( ( (position-min) / (min-max) ) * -100 ).toFixed(dot)
                        }

                        function GetVal(min,max,percent) {
                            return Number( ( (min-max)*percent/100-min )*-1 ).toFixed(dot)
                        }

                        function setLine() {

                            el.querySelectorAll('input+span').forEach( (line,i) => {

                                let prev   = el.querySelectorAll('B')[i-1], from,
                                    actual = el.querySelectorAll('B')[i], to;

                                from = prev ? GetPercentage(0,containerwidth,prev.offsetLeft) : 0

                                to = GetPercentage(0,containerwidth,actual.offsetLeft)

                                let getStartPx = (GetVal(0,containerwidth,from)),
                                    getFinishPx = (GetVal(0,containerwidth,to)),
                                    widthDifference = getFinishPx-getStartPx

                                line.style.width = widthDifference+"px";
                                line.style.left  = from+"%";

                            })

                        }

                        dc.sliders.push(rsdc)

                    })

                    result.push(dc)
                    
                })

                resolve(result)

            }
            
            !! reload ? startTask() : this.#tools.onDomReady( () => startTask() )

        })

    }

    async launchDatepiker (reload) {

        return this.data.buttons.datepicker = await new Promise( resolve => {

            let startTask = async ( tools = this.#tools, result = [] ) => {

                document.querySelectorAll('.button.type-date').forEach( el => {
            
                    let dc = {/*dataCollection*/}
            
                    dc.main = el

                    dc.label = el.getElementsByTagName('label')[0]
                    
                    dc.datafields = el.getElementsByTagName('input')

                    dc.datafieldFocused = 1

                    dc.datelist  = []

                    dc.formatSymbol = el.dataset.symbol ? el.dataset.symbol : '-'

                    if( dc.formatSymbol=='~' || /\d/.test(dc.formatSymbol) ){

                        console.error(`⚠ [ ui alert ] ➔ button type-date character symbols error\n  ⮑ Numbers and tilde symbol (~) is reserved date symbol\n  ⮑ warning for element:`, el)


                    } else if ( dc.datafields.length>2 ) {

                        console.error(`⚠ [ ui alert ] ➔ button type-date oversized\n  ⮑ The maximum amount of inputs is two: "start date", "end date".\n  ⮑ warning for element:`, el)
            
                    } else if( dc.datafields.length<1 ) {

                        console.error(`⚠ [ ui alert ] ➔ button type-date subsized\n  ⮑ The minumum amount of inputs is one: are you kidding me?\n  ⮑ warning for element:`, el)
            
                    } else {
            
            
                        //
                        //  1: get type and format of dates
                        //
            
            
                        // is it UTC or EUR? // not EUR.. then UTC
                        let isUTC, isEUR
                        
                        if (el.classList.contains("EUR"))
                            isUTC=!1,
                            isEUR=!0
                        else
                            isUTC=!0,
                            isEUR=!1
            
                        dc.dateType= isUTC ? 'UTC' : 'EUR'
            
                        // check date format
            
                        let datepickerclasses = String(el.className).split(' '),
                            formatkey = ["DMY","DYM","MYD","MDY","YDM","YMD"],
                            fkl = formatkey.length
            
                        for (let i=0;i<fkl;i++)
                            if(!(datepickerclasses.indexOf(formatkey[i]) === -1))
                                dc.dateformat = String(formatkey[i])
            
                        // get order of format
                        let Yi,Mi,Di

                        Yi =  dc.dateformat.indexOf('Y')
                        Mi =  dc.dateformat.indexOf('M')
                        Di =  dc.dateformat.indexOf('D')
            
            
                        //
                        //  2: get basic params
                        //
            
            
                        // set unselected start / end
            
                        for (let i = 0; i < dc.datafields.length; i++)
                            dc.datelist.push({ 'year':null, 'month':null, 'day':null })
            
            
                        //
                        //  3: get actual/start selected date via input or UTC
                        //
            
            
                        if( dc.datafields[0].value=='' ) {
            
            
                            let todaydate  = new Date(),
                                format     = todaydate.toUTCString(),
                                utc_year   = parseInt(todaydate.getUTCFullYear()),
                                utc_month  = parseInt(todaydate.getUTCMonth()),
                                utc_day    = parseInt(todaydate.getUTCDate())
                            // this_week = date.getUTCDay();
            
                            dc.datelist[0].year  = utc_year
                            dc.datelist[0].month = utc_month
                            dc.datelist[0].day   = utc_day
            
                            if( dc.datafields.length==2 )
            
                                dc.datelist[1].year = utc_year,
                                dc.datelist[1].month= utc_month,
                                dc.datelist[1].day  = utc_day+1
            
            
                        } else {
            
            
                            let format,
                                datestart = dc.datafields[0].value
                                
            
                            if( datestart.match(dc.formatSymbol) )
            
                                dc.datelist[0].year  = parseInt(datestart.split(dc.formatSymbol)[Yi]),
                                dc.datelist[0].month = parseInt(datestart.split(dc.formatSymbol)[Mi])-1,
                                dc.datelist[0].day   = parseInt(datestart.split(dc.formatSymbol)[Di])
            
                            else
            
                                datestart         = new Date(parseInt(datestart)),
                                format            = datestart.toUTCString(),
                                dc.datelist[0].year  = parseInt(datestart.getUTCFullYear()),
                                dc.datelist[0].month = parseInt(datestart.getUTCMonth()),
                                dc.datelist[0].day   = parseInt(datestart.getUTCDate())
            
            
                            if( dc.datafields.length==2 ) {
            
                                let dateend = dc.datafields[1].value
            
                                if(dateend.match(dc.formatSymbol))
            
                                    dc.datelist[1].year  = parseInt(dateend.split('-')[Yi]),
                                    dc.datelist[1].month = parseInt(dateend.split('-')[Mi])-1,
                                    dc.datelist[1].day   = parseInt(dateend.split('-')[Di])
            
                                else
            
                                    dateend           = new Date( parseInt(dateend) ),
                                    format            = dateend.toUTCString(),
                                    dc.datelist[1].year  = parseInt(dateend.getUTCFullYear()),
                                    dc.datelist[1].month = parseInt(dateend.getUTCMonth()),
                                    dc.datelist[1].day   = parseInt(dateend.getUTCDate())
            
                            }
            
            
                        }
            
            
                        //
                        //  3: create, connect empty datepicker outbox / get from it
                        //
            
                        // for all, generate a random id from 0 to 1000
            
                        let DATEID =    el.getAttribute('id') ?
                                            'select-'+el.getAttribute('id') :
                                        dc.datafields[0].getAttribute('id') ?
                                            'select-'+dc.datafields[0].getAttribute('id') :
                                        dc.datafields[1] && dc.datafields[1].getAttribute('id') ?
                                            'select-'+dc.datafields[1].getAttribute('id') :
                                            'select-'+ ~~ (Math.random() * 9999)

                        // set target of off canvas
            
                        el.setAttribute("target","open#date-"+DATEID);
            
                        // generate the empty output
            
                        let fromto = dc.datafields.length==2 ? `<div class="fromto"><small class="active"> `+tools.printl("FRIST DATE")+` </small><small class="off"> `+tools.printl("END DATE")+` </small></div>` : `<!--singledate-->` ;
            
                        let empty_output_datepicker =
                        `
                            <div class="box-popup center" id="date-`+DATEID+`">
                                <div class="datepicker">
                            
                                    <div>
                                        <p>`+tools.printl("Select a date")+`</p>
                                    </div>
                            
                                    <div>`+fromto+`</div>
                            
                                    <div>
                            
                                        <div>
                            
                                            <span class="years">
                                                <span class="prev">&nbsp;</span>
                                                <span class="year_list"></span>
                                                <span class="next">&nbsp;</span>
                                            </span>
                            
                                        </div>
                            
                                        <div>
                            
                                            <span class="months">
                                                <span class="prev">&nbsp;</span>
                                                <span class="month_list"></span>
                                                <span class="next">&nbsp;</span>
                                            </span>
                            
                                        </div>
                            
                                    </div>
                            
                                    <div>
                            
                                        <div class="weekday_list">
                                            <div>
                                            </div>
                                        </div>
                            
                                    </div>
                            
                                    <div>
                            
                                        <div class="day_list">
                                            <div>
                                            </div>
                                        </div>
                            
                                    </div>
                            
                                    <div>
                            
                                        <div class="button align-center">
                                            <a class="close">`+tools.printl("Accept")+`</a>
                                        </div>
                            
                                    </div>
                            
                                </div>
                            </div>
                        `;
            
                        // print output in page
            
                        document.getElementsByTagName('BODY')[0].insertAdjacentHTML('beforeEnd',empty_output_datepicker)
            
                        // setTimeout(()=>{
            
            
                            // get output in page
            
                            dc.popup = document.querySelectorAll("#date-"+DATEID)[0]
            
                            // get datepiker elements
            
                            dc.accept         = dc.popup.querySelectorAll(".close")[0]
                            let year_list     = dc.popup.querySelectorAll(".year_list")[0],
                                month_list    = dc.popup.querySelectorAll(".month_list")[0],
                                weekday_list  = dc.popup.querySelectorAll(".weekday_list>div")[0],
                                day_list      = dc.popup.querySelectorAll(".day_list>div")[0]
            
            
                            //
                            // 4.1: populate years for a start
                            //
            
                            // create year list
            
                            let y_htmlcontents = [],
                                yearmin,
                                yearmax
            
                            let ininputmin = parseInt(el.firstElementChild.min),
                                ininputmax = parseInt(el.firstElementChild.max)
            
            
                            if(!ininputmin || ininputmin=='' && !ininputmax || ininputmax=='') {
            
                                yearmin = 1950
                                yearmax = 2050
            
                            } else {
            
                                if(!ininputmax || ininputmin>ininputmax)
            
                                    console.warnign(`⚠ [ ui alert ] ➔ button type-date strange min/max\n  ⮑ The max value is undefined or min is over to max.\n    Will be applied standard max "2050"`),
                                    yearmin = ininputmin,
                                    yearmax = 2050
            
                                else if(!ininputmin)
            
                                    console.warnign(`⚠ [ ui alert ] ➔ button type-date strange min/max\n  ⮑ The min value is undefined.\n    Will be applied standard min "1950"`),
                                    yearmin = 1950,
                                    yearmax = ininputmax
            
                                else
            
                                    yearmin = ininputmin,
                                    yearmax = ininputmax
                
                            }

                            dc.min = yearmin
                            dc.max = yearmax
            
                            for (let i = yearmin; i <= yearmax; i++)
                                y_htmlcontents.push('<p class="off hide">'+ i +'</p>')
            
            
                            y_htmlcontents =  String( y_htmlcontents.join(' ') )
                            year_list.innerHTML =  y_htmlcontents
            
            
                            // set for start
            
                            let Years    = year_list.querySelectorAll("p"),
                                yearsQnt = Years.length
            
                            if(ininputmin == ininputmax)
            
                            
                                for (let i = 0; i < yearsQnt; i++)
                                    Years[i].classList.remove("off","hide"),
                                    Years[i].classList.add("active")
            
                            
                            else
            
                                for (let i = 0; i < yearsQnt; i++)
                                    if(parseInt(Years[i].textContent) == dc.datelist[0].year )
                                        Years[i].classList.remove("off","hide"),
                                        Years[i].classList.add("active")
            
            
                            //
                            // 4.2: populate months for a start
                            //
            
            
                            // create month list
            
                            let m_htmlcontents = [],
                                monthArray = [
                                    tools.printl('January'),
                                    tools.printl('February'),
                                    tools.printl('March'),
                                    tools.printl('April'),
                                    tools.printl('May'),
                                    tools.printl('June'),
                                    tools.printl('July'),
                                    tools.printl('August'),
                                    tools.printl('September'),
                                    tools.printl('October'),
                                    tools.printl('November'),
                                    tools.printl('December')
                                ]
            
                            for (let i = 0; i <= 11; i++)
                                m_htmlcontents.push('<p class="off hide">'+ monthArray[i] +'</p>')
            
                            month_list.innerHTML = m_htmlcontents.join(' ')
            
            
                            // set for start
            
                            let Months = month_list.querySelectorAll("p"),
                                monthsQnt = Months.length
            
                            for (let i = 0; i < monthsQnt; i++)
                                if(i == dc.datelist[0].month)
                                    Months[i].classList.remove("off","hide"),
                                    Months[i].classList.add("active")
            
            
            
                            //
                            // 4.3: populate weekdays
                            //
            
                            // create weekday list
            
                            let dw_htmlcontents = [], dayweeks
            
                            dayweeks = isEUR ? [
                                tools.printl("Mon"),
                                tools.printl("Tue"),
                                tools.printl("Wed"),
                                tools.printl("Thu"),
                                tools.printl("Fri"),
                                tools.printl("Sat"),
                                tools.printl("Sun")
                            ] : [
                                tools.printl("Sun"),
                                tools.printl("Mon"),
                                tools.printl("Tue"),
                                tools.printl("Wed"),
                                tools.printl("Thu"),
                                tools.printl("Fri"),
                                tools.printl("Sat")
                            ]
            
                            for (let i = 0; i < dayweeks.length; i++)
                                dw_htmlcontents.push( '<div><small>'+ dayweeks[i] +'</small></div>' ) //class="box-[14-14-14]"
            
                            //print dayweek
                            weekday_list.innerHTML =  dw_htmlcontents.join(' ')
            
            
            
                            //
                            // 4.4: populate days...
                            //
            
            
                            // ::: daylist not have a start print. It's auto created by utc data
                            // ::: after selected, or have in start, an year and month sys can "get days list of that date"
                            // ::: ex: get days quantity of "May" "2001" -> get the days qnt of that date
                            // ::: attention get days qnt start to 0 and need +1 (8+1 = sept) ...
            
            
                            let get_DaysQntOfMounth = (YY,MM) => {
            
                                // get day list of year/month
                                let getDate = new Date( Date.UTC(YY,MM+1,null) )
                                return parseInt(  getDate.getUTCDate() )
            
                            }
            
                            // ::: Since calendars start with different weeks
                            // ::: (for example in EU start from Monday, not Sunday),
                            // ::: it will be necessary to understand what day 1 is
                            // ::: compared to the first day of the week
                            // ::: attention get weekday start to 1 (8 is sept) and return 0 Sunday, 1 Monday, 2 Tuesday, ...
            
            
                            let get_FirstDayOfweek = (YY,MM) => {
            
                                // get first dayweek of year/month
                                let getDate = new Date( Date.UTC(YY,MM,1) )
                                return parseInt( getDate.getUTCDay() )
            
                            }
            
            
                            // ::: having the methods created above, we can
                            // ::: get a daylist of specific date (in this case, the start).
            
                            let make_days_table = (YY,MM,DD) => {
            
                                day_list.innerHTML = ''
            
                                let firstdayweek     = get_FirstDayOfweek(YY,MM),
                                    dayinactualmonth = get_DaysQntOfMounth(YY,MM),
                                    calendarcell     = 44, // remember: start to 0
                                    d_htmlcontents   = [],
                                    daytabulator     = parseInt(  (calendarcell-(firstdayweek+1)) ),
                                    tablength        = (isEUR ? daytabulator : daytabulator-1)
            
                                for ( let i = isEUR ? (firstdayweek+5)*-1 : (firstdayweek-1)*-1 ; i <= tablength ; i++ ) {
            
                                    let day = i,
                                        status = "off",
                                        style=""
            
                                    if(day>=1 && day<=9) { day="0"+i }
                                    if(day<=0 || i>dayinactualmonth){ day = "░", style='style="opacity:0.5"', status = "off disabled" }
                                    else if(day == DD) { status = "active", style='' }
            
                                    d_htmlcontents.push('<div '+style+'><p class="day '+status+'">'+ day +'</p></div>'); //dayout //  14% width
            
                                }
            
                                day_list.innerHTML =  d_htmlcontents.join(' ')
            
            
                                // in case of line of day is empty (compact mode)
            
                                if(!!el.dataset.compact) {
            
                                        // trim first white line
            
                                        let firslist = Array.from(dc.popup.querySelectorAll('.day_list .day')),
                                            firsLineDays = firslist.slice(0,6),
                                            isFirstlineAwhiteLine = 0

                                        for (let i = 0; i < firsLineDays.length; i++)
                                            if( firsLineDays[i].textContent == "░" ) isFirstlineAwhiteLine++

                                        if(isFirstlineAwhiteLine==7)
                                            for (let i = 0; i <= 6; i++)
                                                firsLineDays[i].parentNode.remove()
            
            
                                        // trim last white line

                                        let lastlist = Array.from(dc.popup.querySelectorAll('.day_list .day')),
                                            lastLineDays = lastlist.slice(35,lastlist.length),
                                            isLastlineAwhiteLine = 0

                                        for (let i = 0; i < lastLineDays.length; i++)
                                            if(lastLineDays[i].textContent == "░") isLastlineAwhiteLine++
                                            
                                        if(isLastlineAwhiteLine==7)
                                            for (let i = 0; i < lastLineDays.length; i++)
                                                lastLineDays[i].parentNode.remove()
            
            
                                }
            
            
                            }
            
            
                            make_days_table( dc.datelist[0].year, dc.datelist[0].month, dc.datelist[0].day ) //<== create start
            
            
                            //
                            //  5: set contents via actions
                            //
            
                            // find actual static values on call
            
                            let getActualMonth = () => {
            
                                for (let i = 0; i < monthsQnt; i++)
                                    if(Months[i].classList.contains("active"))
                                        return i;
            
                            }
            
                            let getActualYear = () => {
            
                                for (let i = 0; i < yearsQnt; i++)
                                    if(Years[i].classList.contains("active"))
                                        return parseInt(Years[i].innerText);
            
                            }
            
                            let getActualDay = () => {
            
                                let days = dc.popup.querySelectorAll('.day_list .day'),
                                    daysQnt = days.length;
            
                                for (let i = 0; i < daysQnt; i++)
                                    if(days[i].classList.contains("active"))
                                        return parseInt(days[i].innerText);
            
                            }
            
                            // A) switch years
            
                            let YearPrev = dc.popup.querySelector('.years>.prev'),
                                YearNext = dc.popup.querySelector('.years>.next')
            
                            YearPrev.onclick = () => { goToPrevYear() }
                            YearNext.onclick = () => { goToNextYear() }
            
                            if( 'ontouchstart' in window ) {
            
                                year_list.ontouchstart = event_datepiking => {
            
                                    let dir    = event_datepiking.touches[0].clientX
            
                                    year_list.ontouchmove = event_datepiking => {
            
                                        if(event_datepiking.target != year_list) event_datepiking.preventDefault() //prevent body scroll
                                        if(dir > event_datepiking.changedTouches[0].clientX+75) { dir = event_datepiking.touches[0].clientX; goToPrevYear() }
                                        if(dir < event_datepiking.changedTouches[0].clientX-75) { dir = event_datepiking.touches[0].clientX; goToNextYear() }
            
                                    }
            
                                    year_list.ontouchend = event_datepiking => {
            
                                        dir = null
                                        event_datepiking = null
                                        window.ontouchmove = null
            
                                    }
            
                                }
            
                            } else {
            
                                year_list.onmousedown = event_datepiking => {
            
                                    let dir = event_datepiking.clientX
            
                                    window.onmousemove = event_datepiking => {
            
                                        if(dir > event_datepiking.clientX+5){ dir = event_datepiking.clientX; goToPrevYear() }
                                        if(dir < event_datepiking.clientX-5){ dir = event_datepiking.clientX; goToNextYear() }
            
                                    }
            
                                    window.onmouseup = event_datepiking => {
            
                                        dir = null
                                        event_datepiking = null
                                        window.onmousemove = null
            
                                    }
            
                                }
            
                            }
            
                            function goToPrevYear() {
            
                                for (let i = 0; i < yearsQnt; i++) {
            
                                    if( Years[i].classList.contains("active") && Years[i-1] ) {
            
                                        Years[i].classList.add("off","hide")
                                        Years[i].classList.remove("active")
            
                                        Years[i-1].classList.add("active")
                                        Years[i-1].classList.remove("off","hide")
            
                                        let f = (dc.datafieldFocused==2 && dc.datafieldFocused==2)?1:0
            
                                        dc.datelist[f].year = Years[i-1].innerText
                                        dc.datelist[f].month = getActualMonth()
                                        dc.datelist[f].day = getActualDay()
                                        make_days_table(dc.datelist[f].year, dc.datelist[f].month, dc.datelist[f].day)
            
                                        return false;
                                    }
            
                                }
            
                            }
            
                            function goToNextYear() {
            
                                for (let i = 0; i < yearsQnt; i++) {
            
                                    if(Years[i].classList.contains("active") && Years[i+1]) {
            
                                        Years[i].classList.add("off","hide")
                                        Years[i].classList.remove("active")
            
                                        Years[i+1].classList.add("active")
                                        Years[i+1].classList.remove("off","hide")
            
                                        let f = (dc.datafieldFocused==2 && dc.datafieldFocused==2)?1:0
            
                                        dc.datelist[f].year = Years[i+1].innerText
                                        dc.datelist[f].month = getActualMonth()
                                        dc.datelist[f].day = getActualDay()
                                        make_days_table(dc.datelist[f].year, dc.datelist[f].month, dc.datelist[f].day)
            
                                        return false;
                                    }
            
                                }
            
                            }
            
            
                            // B) switch month
            
                            let MonthPrev = dc.popup.querySelector('.months>.prev'),
                                MonthNext = dc.popup.querySelector('.months>.next')
            
                            MonthPrev.onclick = () => { goToPrevMonth() }
                            MonthNext.onclick = () => { goToNextMonth() }
            
            
                            if('ontouchstart' in window) {
            
                                month_list.ontouchstart = event_datepiking => {
            
                                    let dir = event_datepiking.touches[0].clientX
            
                                    month_list.ontouchmove = event_datepiking => {
            
                                        if(event_datepiking.target != month_list) event_datepiking.preventDefault() //prevent body scroll
                                        if(dir > event_datepiking.changedTouches[0].clientX+175){ dir = event_datepiking.touches[0].clientX; goToPrevMonth() }
                                        if(dir < event_datepiking.changedTouches[0].clientX-175){ dir = event_datepiking.touches[0].clientX; goToNextMonth() }
            
                                    }
            
                                    window.ontouchend = event_datepiking => {
            
                                        dir = null
                                        event_datepiking = null
                                        window.ontouchmove = null
            
                                    }
                                }
                            } else {
            
                                month_list.onmousedown = event_datepiking => {
            
                                    let dir = event_datepiking.clientX
            
                                    window.onmousemove = event_datepiking => {
            
                                        if(dir > event_datepiking.clientX+35){ dir = event_datepiking.clientX; goToPrevMonth() }
                                        if(dir < event_datepiking.clientX-35){ dir = event_datepiking.clientX; goToNextMonth() }
                                    }
            
                                    window.onmouseup = event_datepiking => {
            
                                        dir = null
                                        event_datepiking = null
                                        window.onmousemove = null
            
                                    }
                                }
                            }
            
                            function goToPrevMonth() {
            
                                for (let i = 0; i < monthsQnt; i++) {
            
                                    if(Months[i].classList.contains("active") && Months[i-1]) {
            
                                        Months[i].classList.replace("active","off")
                                        Months[i].classList.add("hide")
            
                                        Months[i-1].classList.add("active")
                                        Months[i-1].classList.remove("off","hide")
            
                                        let f = (dc.datafieldFocused==2 && dc.datafieldFocused==2)?1:0
            
                                        dc.datelist[f].year = getActualYear()
                                        dc.datelist[f].month = i-1
                                        dc.datelist[f].day = getActualDay()
                                        make_days_table(dc.datelist[f].year, dc.datelist[f].month, dc.datelist[f].day)
            
                                        return false;
            
                                    }
            
                                }
            
                            }
            
                            function goToNextMonth() {
            
                                for (let i = 0; i < monthsQnt; i++) {
            
                                    if(Months[i].classList.contains("active") && Months[i+1]) {
            
                                        Months[i].classList.replace("active","off")
                                        Months[i].classList.add("hide")
            
                                        Months[i+1].classList.add("active")
                                        Months[i+1].classList.remove("off","hide")
            
                                        let f = (dc.datafieldFocused==2 && dc.datafieldFocused==2)?1:0
            
                                        dc.datelist[f].year = getActualYear()
                                        dc.datelist[f].month = i+1
                                        dc.datelist[f].day = getActualDay()
                                        make_days_table(dc.datelist[f].year, dc.datelist[f].month, dc.datelist[f].day)
            
                                        return false;
            
                                    }
            
                                }
            
                            }
            
            
            
                            // C) switch/make days
            
                            dc.popup.addEventListener('click', event_dayselection => { //update date on every click 
            
                                let dateselected ={},
                                    Days = dc.popup.querySelectorAll('.day_list .day'),
                                    daysQnt = Days.length
            
                                for (let i = 0; i < daysQnt; i++) {
            
                                    Days[i].onclick = () => {
            
                                        for (let i = 0; i < daysQnt; i++) {
            
                                            Days[i].classList.remove("active");
                                            Days[i].classList.add("off");
            
                                        }
            
                                        event_dayselection.target.classList.remove("off","hide")
                                        event_dayselection.target.classList.add("active")
            
                                        let f = (dc.datafieldFocused==2 && dc.datafieldFocused==2)?1:0
            
                                        dc.datelist[f].year = getActualYear()
                                        dc.datelist[f].month = getActualMonth()
                                        dc.datelist[f].day = parseInt(event_dayselection.target.innerText)
            
                                        // printDate()
            
                                    }
            
                                }
            
                            },true)
            
                            // D) switch selector from-to
            
                            if(dc.datafields.length==2) {
            
                                let dateOne = dc.popup.querySelectorAll('.fromto>small')[0],
                                    dateTwo = dc.popup.querySelectorAll('.fromto>small')[1]
            
                                dateOne.onclick = event_dateSelector => {
            
                                    //update focus
                                    dc.datafieldFocused  = 1; dateOne.classList.replace('off','active'), dateTwo.classList.replace('active','off')
            
                                    //update yeara label
                                    for (let i = 0; i < yearsQnt; i++) {
            
                                        if(dc.datelist[0].year == Years[i].innerText){ Years[i].classList.remove('off','hide'), Years[i].classList.add('active') }
                                        else { Years[i].classList.remove('active'), Years[i].classList.add('off','hide')}
            
                                    }
            
                                    //update month label
                                    for (let i = 0; i < monthsQnt; i++) {
            
                                        if(dc.datelist[0].month == i){ Months[i].classList.remove('off','hide'), Months[i].classList.add('active') }
                                        else { Months[i].classList.remove('active'), Months[i].classList.add('off','hide')}
            
                                    }
            
                                    //update daytable
                                    make_days_table(dc.datelist[0].year, dc.datelist[0].month, dc.datelist[0].day)
            
                                    event_dateSelector=null
            
                                }
            
                                dateTwo.onclick = event_dateSelector => {
            
                                    //update focus
                                    dc.datafieldFocused = 2
                                    dateTwo.classList.replace('off','active')
                                    dateOne.classList.replace('active','off')
            
                                    //update yeara label
                                    for (let i = 0; i < yearsQnt; i++) {
            
                                        if(dc.datelist[1].year == Years[i].innerText){ Years[i].classList.remove('off','hide'), Years[i].classList.add('active') }
                                        else { Years[i].classList.remove('active'), Years[i].classList.add('off','hide')}
            
                                    }
            
                                    //update month label
                                    for (let i = 0; i < monthsQnt; i++) {
            
                                        if(dc.datelist[1].month == i){ Months[i].classList.remove('off','hide'), Months[i].classList.add('active') }
                                        else { Months[i].classList.remove('active'), Months[i].classList.add('off','hide')}
            
                                    }
            
                                    //update daytable
                                    make_days_table(dc.datelist[1].year, dc.datelist[1].month, dc.datelist[1].day)
            
                                    event_dateSelector=null
            
                                }
            
                            }
            
            
                            //
                            // 7: update the datepiker and input values
                            //
            
                            // check date switcher
            
                            function printDate() {
            
                                if(dc.datafields.length==2) {
            
                                    let datetime1 = new Date(dc.datelist[0].year,dc.datelist[0].month,dc.datelist[0].day+1).getTime(),
                                        datetime2 = new Date(dc.datelist[1].year,dc.datelist[1].month,dc.datelist[1].day+1).getTime() //sys subtract 1 to refresh D:
            
                                    if(datetime1>=datetime2) {
            
                                        dc.accept.parentNode.classList.add('disabled');
                                        dc.accept.innerText = 'NO VALID DATES!';
            
                                    }
            
                                    else {
            
                                        let days = [...dc.popup.querySelectorAll('.day_list .day')],
                                            daysQnt = days.length
            
                                        //reset
                                        for (let i = 0; i < daysQnt; i++)
                                            days[i].classList.remove('off','date-range','date-range-first','date-range-last')
            
                                        //setit
            
                                        let daystart    = dc.datelist[0].day,
                                            dayend      = dc.datelist[1].day,
            
                                            actualMonth = (dc.datafieldFocused==2)?dc.datelist[1].month:dc.datelist[0].month,
                                            minMonth    = dc.datelist[0].month,
                                            maxMonth    = dc.datelist[1].month,
            
                                            actualYear  = (dc.datafieldFocused==2)?dc.datelist[1].year:dc.datelist[0].year,
                                            minYear     = dc.datelist[0].year,
                                            maxYear     = dc.datelist[1].year;
            
                                        for (let i = 0; i < daysQnt; i++) {
            
                                            let dayclass    = days[i].classList,
                                                daynumber   = parseInt(days[i].innerText)
            
                                            if(Number.isInteger(daynumber)) {
            
                                                if( actualYear >= minYear && actualYear <= maxYear ) {
            
                                                    if(actualYear==minYear && actualMonth == minMonth && daynumber==daystart) {
            
                                                        dayclass.remove('date-range')
                                                        dayclass.add('date-range-first')
            
                                                    }
            
                                                    else if(actualYear==maxYear && actualMonth == maxMonth && daynumber==dayend) {
            
                                                        dayclass.remove('date-range')
                                                        dayclass.add('date-range-last')
            
                                                    }
            
                                                    else
                                                    {
            
                                                        if(actualMonth == minMonth && actualMonth == maxMonth && daynumber>daystart && daynumber<dayend) {
            
                                                            dayclass.add('date-range')
            
                                                        }
            
                                                        else if(actualMonth != minMonth || actualMonth != maxMonth) {
            
                                                            if(actualMonth == minMonth && daynumber>daystart)
                                                                dayclass.add('date-range')
            
                                                            else if(actualMonth == maxMonth && daynumber<dayend)
                                                                dayclass.add('date-range')
            
                                                            else if(actualMonth > minMonth && actualMonth < maxMonth)
                                                                dayclass.add('date-range')
            
                                                            else
                                                                dayclass.remove('date-range'),
                                                                dayclass.add('off')
            
                                                        }
            
                                                        else {
            
                                                            dayclass.remove('date-range')
                                                            dayclass.add('off')
            
                                                        }
            
                                                    }
            
                                                }
            
                                                else {
            
                                                    dayclass.remove('date-range')
                                                    dayclass.add('off')
            
                                                }
            
                                            }
            
            
                                        }
            
                                        dc.accept.parentNode.classList.remove('disabled')
                                        dc.accept.innerText = 'Accept'
                                    }
            
                                }
            
                                else {
            
                                    dc.datafields[0].value = new Date(dc.datelist[0].year,dc.datelist[0].month,dc.datelist[0].day).getTime();
                                    dc.label.innerText = dc.datelist[0].day+'-'+(dc.datelist[0].month+1)+'-'+dc.datelist[0].year
            
                                }
            
                            }
            
                            dc.accept.addEventListener( 'click', () => {
            
            
                                if(dc.datafields.length==2) {
            
                                    let datetime1 = new Date(dc.datelist[0].year,dc.datelist[0].month,dc.datelist[0].day+1).getTime() //sys subtract 1 to refresh D:
                                    let datetime2 = new Date(dc.datelist[1].year,dc.datelist[1].month,dc.datelist[1].day+1).getTime()
            
                                    if(datetime1!=dc.datafields[0].value) dc.datafields[0].value = datetime1
                                    if(datetime2!=dc.datafields[1].value) dc.datafields[1].value = datetime2
                                    dc.label.innerText = dc.datelist[0].day+dc.formatSymbol+(dc.datelist[0].month+1)+dc.formatSymbol+dc.datelist[0].year+' ~ '+dc.datelist[1].day+dc.formatSymbol+(dc.datelist[1].month+1)+dc.formatSymbol+dc.datelist[1].year
            
                                }
            
                                else {
            
                                    dc.datafields[0].value = new Date(dc.datelist[0].year,dc.datelist[0].month,dc.datelist[0].day).getTime()
                                    dc.label.innerText = dc.datelist[0].day+dc.formatSymbol+(dc.datelist[0].month+1)+dc.formatSymbol+dc.datelist[0].year
            
                                }
            
                                // printDate()
            
                            })
            
                            // //active/off week
                            // let weekinbox = [...weekday_list.querySelectorAll("p")];
                            // for (let i = 0; i < weekinbox.length; i++)
                            // {
                            //
                            //     weekinbox[i].classList.add("off","disabled");
                            //
                            //     if( i == this_week-1 )
                            //     {
                            //       weekinbox[i].classList.remove("off","disabled");
                            //       weekinbox[i].classList.add("active");
                            //     }
                            //
                            // }
                        }


                        this.launchPopups(true)

                        result.push(dc)
            
                    // },100)
            
                })
            
                resolve(result)
            
            }
            
            !! reload ? startTask() : this.#tools.onDomReady( () => startTask() )

        })

    }

}

const ui = new uiController()

// how to use:
// 
// > if standard:
//
// <script src="ui/ui.core.js"></script>
// <script>
//    ui.ready.then( async asset => {
//        console.log('the init test data:', ui.unveil(asset) )
//        asset.produceTheSecondDataAsset('rewritten ')
//        console.log('the refreshed data:', ui.unveil(asset) )
//    })
// </script>
//
// > if exportable:
//
// now you can import where you want the base and work with the assets
// <script type="module">
//     import { ui } from 'wusy.core.js';
//     ui.then( async asset => {
//         await asset.AUIMETHOD('UIOPTIONS');
//         console.log('the refreshed data:', ui.unveil(asset) );
//     });
// </script>
//
// unveil method note:
//      If you try to print an object in console and then edit it, that 
//      object will only appear as in the latest update. Hence, you can 
//      no longer read the previous status. It is a purely visual phenomenon 
//      (the state, if called by navigating the object, is then legible).
//      This is a known browser debugging bug. To work around you can use the 
//      unveil (obj) method. Without it, you will only be able to see your 
//      latest status.Exemple: console.log( ui.unveil(asset) )
//      reaad more on: https://stackoverflow.com/q/4057440/19579604