
class CustomModal {
    constructor(config,cbFn){
        this.config = config;
        this.file = null;
        this.fileLink = null;
        this.cbFn = cbFn;
        this.customModal = null;
        this.arrListenerRef = [];
    }

    create(){
        _create(this);
    };

    get selectedValue(){
        return this.selected;
    }
}

function _create(localVariable) {
    _createModal(localVariable);
}

function _createModal(localVariable){

    var typeOfModal = localVariable.config.type;

    //Custom Modal Main Structure
    var customModalOverlay = document.createElement('div'),
        customModalContainer = document.createElement('div'),
        customModalContent = document.createElement('div'),
        customModalHeader = document.createElement('div'),
        customModalBody = document.createElement('div'),
        customModalCta = document.createElement('div');

    customModalOverlay.className = "rte-custom-modal-overlay";
    customModalContainer.className = "rte-custom-modal-container";
    customModalContent.className = "rte-custom-modal-content";

    //Custom Modal Header Definition + Children
    var customModalHeaderSpan = document.createElement('span'),
        customModalHeaderIcon = document.createElement('i');

    customModalHeader.className = "rte-custom-modal-header";

    customModalHeaderSpan.innerHTML = localVariable.config.titleHeader;

    //header icon based on the type of modal
    switch(typeOfModal) {

        case 'image':
            customModalHeaderIcon.className = "icon-image";
            break;

        case 'link':
            customModalHeaderIcon.className = "icon-link";
            break;

        default:

    }

    customModalHeaderSpan.insertAdjacentElement('afterbegin',customModalHeaderIcon);
    customModalHeader.appendChild(customModalHeaderSpan);

    //Custom Modal Body
    customModalBody.className = "rte-custom-modal-body";

    switch(typeOfModal) {

        case 'image':
            customModalBody.appendChild(_createImageUploadView(localVariable)); 
            customModalBody.appendChild(_createUrlView(localVariable));
            break;

        case 'link':
            customModalBody.appendChild(_createUrlView(localVariable));
            break;

        default:
                
    }

    //Custom Modal CTA Children
    var customModalCtaSubmitBtn = document.createElement('button'),
        customModalCtaCloseBtn = document.createElement('button');

    customModalCta.className = "rte-custom-modal-cta";
    
    customModalCtaCloseBtn.id = "cmClose";
    customModalCtaSubmitBtn.id = "cmSubmit";

    customModalCtaSubmitBtn.disabled = true;

    customModalCtaCloseBtn.innerHTML = "取消";
    customModalCtaSubmitBtn.innerHTML = "确定";

    var ctaSubmitListener = _cta.bind(null,'submit',localVariable),
        ctaCloseListener = _cta.bind(null,'close',localVariable);

    localVariable.arrListenerRef.push({
        id: '#cmClose',
        type: 'mousedown',
        listenerRef: ctaCloseListener
    },{
        id: '#cmSubmit',
        type: 'mousedown',
        listenerRef: ctaSubmitListener
    });

    customModalCtaSubmitBtn.addEventListener('mousedown',ctaSubmitListener);
    customModalCtaCloseBtn.addEventListener('mousedown',ctaCloseListener);

    customModalCta.appendChild(customModalCtaSubmitBtn);
    customModalCta.appendChild(customModalCtaCloseBtn);

    customModalContent.appendChild(customModalHeader);
    customModalContent.appendChild(customModalBody);
    customModalContent.appendChild(customModalCta);
    customModalContainer.appendChild(customModalContent);
    customModalOverlay.appendChild(customModalContainer);

    document.body.appendChild(customModalOverlay);

    localVariable.customModal = customModalOverlay;
}

function _createImageUploadView(localVariable){

    var fileInputContainer = document.createElement('div'),
        fileDropArea = document.createElement('div'),
        fileDropAreaSpanInfo = document.createElement('span'),
        fileDropAreaSpanFileChosen = document.createElement('span'),
        fileDropAreaInputFileContainer = document.createElement('div'),
        fileDropAreaInputFile = document.createElement('input'),
        fileDropAreaInputFileLabel = document.createElement('label'),
        fileDropAreaDisabled = document.createElement('div');

    fileInputContainer.className = "file-input-container";
    fileDropArea.id = "fileDropArea";
    fileDropArea.className = "file-drop-area";

    var fileDropAreaDragOverListener = _dragIn,
        fileDropAreaDragEnterListener = _dragIn,
        fileDropAreaDragLeaveListener = _dragOut,
        fileDropAreaDragDropListener = _fileSelect.bind(null,fileDropArea,localVariable);

    fileDropArea.addEventListener('dragenter',fileDropAreaDragEnterListener);
    fileDropArea.addEventListener('dragover',fileDropAreaDragOverListener);
    fileDropArea.addEventListener('dragleave',fileDropAreaDragLeaveListener);
    fileDropArea.addEventListener('drop',fileDropAreaDragDropListener);

    fileDropAreaSpanInfo.innerHTML = "拖动文件到这里 (png,jpg,jpeg)";

    fileDropAreaSpanFileChosen.id = "fileChosen";
    fileDropAreaSpanFileChosen.innerHTML = "没有选择文件";

    fileDropAreaInputFileContainer.style.position = "relative";

    fileDropAreaInputFile.type = "file";
    fileDropAreaInputFile.className = "drop-file-input";
    fileDropAreaInputFile.id = "fileInput";

    var fileSelectListener = _fileSelect.bind(null,fileDropArea,localVariable);
    fileDropAreaInputFile.addEventListener('change',fileSelectListener);

    fileDropAreaInputFileLabel.innerHTML = "选择文件";
    fileDropAreaInputFileLabel.htmlFor = "fileInput";

    fileDropAreaInputFileContainer.appendChild(fileDropAreaInputFile);
    fileDropAreaInputFileContainer.appendChild(fileDropAreaInputFileLabel);
    
    fileDropAreaDisabled.className = "file-drop-area-disabled";
    fileDropAreaDisabled.id = "fileDropAreaDisabled";

    fileDropArea.appendChild(fileDropAreaSpanInfo);
    fileDropArea.appendChild(fileDropAreaSpanFileChosen);
    fileDropArea.appendChild(fileDropAreaInputFileContainer);

    fileInputContainer.appendChild(fileDropArea);
    fileInputContainer.appendChild(fileDropAreaDisabled);

    //Register the listener ref to this localVariable to be used to destroy the listener once the modal is close
    localVariable.arrListenerRef.push({
        id: '#fileDropArea',
        type: 'dragenter',
        listenerRef: fileDropAreaDragEnterListener
    },{
        id: '#fileDropArea',
        type: 'dragover',
        listenerRef: fileDropAreaDragOverListener
    },{
        id: '#fileDropArea',
        type: 'dragleave',
        listenerRef:  fileDropAreaDragLeaveListener
    },{
        id: '#fileDropArea',
        type: 'drop',
        listenerRef:  fileDropAreaDragDropListener
    }, {
        id: '#fileInput',
        type: 'change',
        listenerRef: fileSelectListener
    });

    return fileInputContainer;
}

function _createUrlView(localVariable){

    var typeOfModal = localVariable.config.type;

    var urlInputContainer = document.createElement('div'),
        urlInputEnabler = document.createElement('span'),
        urlInputEnablerLink = document.createElement('a'),
        urlInputContent = document.createElement('div'),
        urlInputContentLabel1 = document.createElement('label'),
        urlInputContentInput = document.createElement('input'),
        urlInputContentSpan = document.createElement('span'),
        urlInputContentCancelLink = document.createElement('a');

    urlInputContainer.className = "url-input-container";
    
    switch(typeOfModal) {

        case 'image':

            //Url Input Enabler
            urlInputEnabler.id = "urlInputEnabler";
            urlInputEnabler.innerHTML = "提供类似这样的链接";

            urlInputEnablerLink.id = "showUrl";
            urlInputEnablerLink.innerHTML = "URL";
            urlInputEnablerLink.href = "javascript:void(0)";

            var urlInputEnablerLinkListener = _urlInputEnabler.bind(null,urlInputEnabler,urlInputContent,localVariable,true);
            
            urlInputEnablerLink.addEventListener('click',urlInputEnablerLinkListener)

            urlInputEnabler.insertAdjacentElement('beforeend',urlInputEnablerLink);

            //Url Input Content
            urlInputContent.className = "url-input-content";

            urlInputContentLabel1.innerHTML = "图片路径 ";

            urlInputContentInput.id = "link";
            urlInputContentInput.type = "text";

            var urlInputContentInputListener = _urlChange.bind(null,localVariable);

            urlInputContentInput.addEventListener('input',urlInputContentInputListener);

            urlInputContentSpan.innerHTML = " | ";

            urlInputContentCancelLink.id = "hideUrl";
            urlInputContentCancelLink.href = "javascript:void(0)";
            urlInputContentCancelLink.innerHTML = "Cancel";

            var urlInputContentCancelLinkListener = _urlInputEnabler.bind(null,urlInputEnabler,urlInputContent,localVariable,false);

            urlInputContentCancelLink.addEventListener('click',urlInputContentCancelLinkListener);

            urlInputContentSpan.insertAdjacentElement('beforeend',urlInputContentCancelLink);

            urlInputContent.appendChild(urlInputContentLabel1);
            urlInputContent.appendChild(urlInputContentInput);
            urlInputContent.appendChild(urlInputContentSpan);

            urlInputContainer.appendChild(urlInputEnabler);
            urlInputContainer.appendChild(urlInputContent);

            //Register all listener to be destroyed when this component is destyroyed
            localVariable.arrListenerRef.push({
                id: '#showUrl',
                type: 'click',
                listenerRef: urlInputEnablerLinkListener
            },{
                id: '#hideUrl',
                type: 'click',
                listenerRef: urlInputContentCancelLinkListener
            },{
                id: '#link',
                type: 'input',
                listenerRef:  urlInputContentInputListener
            });

            break;

        case 'link':

            //Url Input Content
            urlInputContent.className = "url-input-content";
            urlInputContent.style.display = "block";

            urlInputContentLabel1.innerHTML = "链接地址 ";

            urlInputContentInput.id = "link";
            urlInputContentInput.type = "text";

            var urlInputContentInputListener = _urlChange.bind(null,localVariable);

            urlInputContentInput.addEventListener('input',urlInputContentInputListener);

            urlInputContent.appendChild(urlInputContentLabel1);
            urlInputContent.appendChild(urlInputContentInput);

            urlInputContainer.appendChild(urlInputContent);

            localVariable.arrListenerRef.push({
                id: '#link',
                type: 'input',
                listenerRef:  urlInputContentInputListener
            });

            break;

    }

    return urlInputContainer;
}

function _cta(type,localVariable,e){
        e.preventDefault();
        e.stopPropagation();
        
        let rtnValue = null;

        if(type === 'submit'){
            if(localVariable.fileLink != null){
                rtnValue = localVariable.fileLink;
            }

            if(localVariable.file != null){
                rtnValue = localVariable.file;
            }
        }
        
        localVariable.cbFn(rtnValue);

        _destroy(localVariable);
}

function _urlInputEnabler(inputEnabler,inputContent,localVariable,enable,e){
    e.preventDefault();
    e.stopPropagation();

    var dropArea = localVariable.customModal.querySelector('#fileDropAreaDisabled');

    if(enable){
        inputContent.style.display = "block";
        inputEnabler.style.display = "none";
        dropArea.style.display = "block";
        localVariable.file = null;
    } else {
        inputContent.style.display = "";
        inputEnabler.style.display = "";
        dropArea.style.display = "";
    }

}

function _urlChange(localVariable,e){

    e.preventDefault();
    e.stopPropagation();
    
    localVariable.fileLink = e.target.value;

    _toggleFlagSubmitBtn(localVariable);

}

function _dragIn(e){
    e.preventDefault();
    e.stopPropagation();

    this.style.backgroundColor = "#2BA229";
}

function _dragOut(e){
    e.preventDefault();
    e.stopPropagation();

    this.style.backgroundColor = "";
}

function _fileSelect(fileDropArea,localVariable,e){
    e.preventDefault();
    e.stopPropagation();

    var uploadFile = null;

    if(e.type === "change"){

        uploadFile = _fileOps(e.srcElement.files,localVariable);

    } else if (e.type === "drop"){
        let dt = e.dataTransfer;
        
        fileDropArea.style.backgroundColor = "";

        uploadFile = _fileOps(dt.files,localVariable);
    }

    fileChosen.innerHTML = uploadFile.name;
}

function _fileOps(files,localVariable){

    if(files.length > 1) {
        throw alert('只能选择一个文件');
    }

    var uploadFile = files[0];

    switch (uploadFile.type) {
        case "image/png":
        case "image/jpg":
        case "image/jpeg":
            break;
        default:
            uploadFile = null;
            throw alert('只接受 png,jpg,jpeg');
            break;
    }

    //var blobUrl = window.URL.createObjectURL(uploadFile);

    var fr = new FileReader();
    
    var frListener = fr.addEventListener('load',function(){
        localVariable.file = fr.result;
        _toggleFlagSubmitBtn(localVariable);
        fr.removeEventListener('load',frListener);
    });
    
    fr.readAsDataURL(uploadFile);

    return uploadFile;
}

function _destroy(localVariable){

    localVariable.customModal.display = "none";

    //Remove all event listener
    for(var i = 0; i < localVariable.arrListenerRef.length; i++){
        var elem = localVariable.customModal.querySelector(localVariable.arrListenerRef[i].id);
        //https://stackoverflow.com/questions/11565471/removing-event-listener-which-was-added-with-bind
        elem.removeEventListener(localVariable.arrListenerRef[i].type,localVariable.arrListenerRef[i].listenerRef)
    }
    
    //Remove all the element
    setTimeout(()=>{
        document.body.removeChild(localVariable.customModal);
        localVariable.file = undefined;
        localVariable.fileLink = undefined;
        localVariable.arrListenerRef = undefined;
        localVariable.config = undefined;
        localVariable.cbFn = undefined;
        localVariable.customModal = undefined;
    },0);
   
}

function _toggleFlagSubmitBtn(localVariable) {

    var typeOfModal = localVariable.config.type,
        cmSubmitElem = document.getElementById('cmSubmit');

    //TODO?: Future add url validation
    //var urlRegex = new RegExp('/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/');
    //console.log(inputVal);
    //console.log(urlRegex.test(inputVal));

    if(typeOfModal === 'link') {

        cmSubmitElem.disabled = (localVariable.fileLink === '') ? true : false;
        
    } else {

        cmSubmitElem.disabled = (localVariable.fileLink === '' || localVariable.file === '') ? true : false;

    }

}

export default CustomModal;
