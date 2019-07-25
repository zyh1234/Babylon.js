/**
 * This JS file is for UI displaying
 */
class MenuPG {
    constructor(parent) {
        this.parent = parent;

        this.allSelect = document.querySelectorAll('.select');
        this.allToDisplay = document.querySelectorAll('.toDisplay');
        this.allToDisplayBig = document.querySelectorAll('.toDisplayBig');
        this.allSubItems = document.querySelectorAll('.toDisplaySub');
        this.allSubSelect = document.querySelectorAll('.subSelect');
        this.allNoSubSelect = document.querySelectorAll('.noSubSelect');

        this.jsEditorElement = document.getElementById('jsEditor');
        this.canvasZoneElement = document.getElementById('canvasZone');
        this.switchWrapper = document.getElementById('switchWrapper');
        this.switchWrapperCode = document.getElementById('switchWrapperCode');
        this.switchWrapperCanvas = document.getElementById('switchWrapperCanvas');
        this.fpsLabelElement = document.getElementById('fpsLabel');
        this.navBarMobile = document.getElementsByClassName('navBarMobile')[0];

        // Check if mobile version
        this.isMobileVersion = false;
        if (this.navBarMobile.offsetHeight > 0) this.isMobileVersion = true;
        window.onresize = function () {
            if (!this.isMobileVersion && this.navBarMobile.offsetHeight > 0) {
                this.isMobileVersion = true;
                this.resizeBigCanvas();
            }
            else if (this.isMobileVersion && this.navBarMobile.offsetHeight == 0) {
                this.isMobileVersion = false;
                this.resizeSplitted();
            }
        }.bind(this);

        // In mobile mode, resize JSEditor and canvas
        this.switchWrapperCode.addEventListener('click', this.resizeBigJsEditor.bind(this));
        this.switchWrapperCanvas.addEventListener('click', this.resizeBigCanvas.bind(this));
        document.getElementById('runButtonMobile').addEventListener('click', this.resizeBigCanvas.bind(this));

        // Code editor by default.
        if (this.navBarMobile.offsetHeight > 0) this.resizeBigJsEditor();

        // Handle click on select elements
        for (var index = 0; index < this.allSelect.length; index++) {
            this.allSelect[index].addEventListener('click', this.displayMenu.bind(this));
        }

        // Handle mouseover / click on subSelect
        for (var index = 0; index < this.allSubSelect.length; index++) {
            var ss = this.allSubSelect[index];
            ss.addEventListener('click', this.displaySubitems.bind(this));
            ss.addEventListener('mouseenter', this.displaySubitems.bind(this));
        }
        for (var index = 0; index < this.allNoSubSelect.length; index++) {
            var ss = this.allNoSubSelect[index];
            ss.addEventListener('mouseenter', this.removeAllSubItems.bind(this));
        }

        // Examples must remove all the other menus
        var examplesButton = document.getElementsByClassName("examplesButton");
        for (var i = 0; i < examplesButton.length; i++) {
            examplesButton[i].addEventListener("click", this.removeallOptions);
        }

        // Fullscreen
        document.getElementById("renderCanvas").addEventListener("webkitfullscreenchange", function () {
            if (document.webkitIsFullScreen) this.goFullPage();
            else this.exitFullPage();
        }.bind(this), false);

        // Click on BJS logo redirection to BJS homepage
        let logos = document.getElementsByClassName('logo');
        for (var i = 0; i < logos.length; i++) {
            logos[i].addEventListener('click', function () {
                window.open("https://babylonjs.com", "_target");
            });
        }

        // Message before unload
        window.addEventListener('beforeunload', function () {
            this.exitPrompt();
        }.bind(this));

        // On click anywhere, remove displayed options
        window.addEventListener('click', function () {
            this.removeAllOptions();
        }.bind(this));

        // Version selection
        for (var i = 0; i < this.parent.utils.multipleSize.length; i++) {
            var versionButtons = document.getElementById("currentVersion" + this.parent.utils.multipleSize[i]).parentElement;
            versionButtons.addEventListener("click", function (evt) {
                this.displayVersionsMenu(evt);
            }.bind(this));

            for (var j = 0; j < CONFIG_last_versions.length; j++) {
                var newButton = document.createElement("div");
                newButton.classList.add("option");
                // newButton.classList.add("noSubSelect");
                newButton.innerText = CONFIG_last_versions[j][0];
                newButton.value = CONFIG_last_versions[j][1];

                newButton.addEventListener("click", function (evt) {
                    this.parent.settingsPG.setBJSversion(evt);
                    this.displayWaitDiv();
                }.bind(this));

                versionButtons.lastElementChild.appendChild(newButton);
            }
        }

        this.showQRCodes();
    }

    /**
     * The logo displayed while loading the page
     */
    displayWaitDiv() {
        document.getElementById("waitDiv").style.display = "flex";
    };
    hideWaitDiv() {
        document.getElementById("waitDiv").style.display = "none";
    };

    displayVersionNumber(version) {
        this.hideWaitDiv();
        for (var i = 0; i < this.parent.utils.multipleSize.length; i++) {
            document.getElementById("currentVersion" + this.parent.utils.multipleSize[i]).parentElement.firstElementChild.innerText = "v." + version;
        }
    };

    /**
     * Display children menu of the version button
     */
    displayVersionsMenu(evt) {
        if (evt.target.classList.contains("option")) return;

        var toggle = evt.target.lastElementChild;
        if (toggle == null) toggle = evt.target.parentElement.lastElementChild;
        if (toggle.style.display == "none") toggle.style.display = "block";
        else toggle.style.display = "none";
    };
    /**
     * Display children menu of the caller
     */
    displayMenu(evt) {
        if (evt.target.nodeName != "IMG") {
            evt.preventDefault();
            evt.stopPropagation();
            return;
        }
        var toDisplay = evt.target.parentNode.querySelector('.toDisplay');
        if (toDisplay) {
            if (toDisplay.style.display == 'block') {
                this.removeAllOptions();
            } else {
                this.removeAllOptions();
                toDisplay.style.display = 'block';
            }
        }
        toDisplay = evt.target.parentNode.querySelector('.toDisplayBig');
        if (toDisplay) {
            if (toDisplay.style.display == 'block') {
                this.removeAllOptions();
            } else {
                this.removeAllOptions();
                toDisplay.style.display = 'block';
            }
        }
        evt.preventDefault();
        evt.stopPropagation();
    };
    /**
     * Display children subMenu of the caller
     */
    displaySubitems(evt) {
        // If it's in mobile mode, avoid the "mouseenter" bug
        if (evt.type == "mouseenter" && this.navBarMobile.offsetHeight > 0) return;
        this.removeAllSubItems();

        var target = evt.target;
        if (target.nodeName == "IMG") target = evt.target.parentNode;

        var toDisplay = target.querySelector('.toDisplaySub');
        if (toDisplay) {
            toDisplay.style.display = 'block';

            if (document.getElementsByClassName('navBarMobile')[0].offsetHeight > 0) {
                var height = toDisplay.children.length * 33;
                var parentTop = toDisplay.parentNode.getBoundingClientRect().top;
                if ((height + parentTop) <= window.innerHeight) {
                    toDisplay.style.top = parentTop + "px";
                }
                else {
                    toDisplay.style.top = window.innerHeight - height + "px";
                }
            }
        }

        evt.preventDefault();
        evt.stopPropagation();
    };
    /**
     * Handle click on subOptions
     */
    clickOptionSub(evt) {
        var target = evt.target;
        if (evt.target.tagName == "A") target = evt.target.parentNode;
        if (!document.getElementsByClassName('navBarMobile')[0].offsetHeight > 0) return; // If is not in mobile, this doesnt apply
        if (!target.classList) return;

        if (target.classList.contains('link')) {
            window.open(target.querySelector('a').href, '_new');
        }
        if (!target.classList.contains('subSelect') && target.parentNode.style.display == 'block') {
            target.parentNode.style.display = 'none'
        }

        evt.preventDefault();
        evt.stopPropagation();
    };

    /**
     * Remove displayed subItems
     */
    removeAllSubItems() {
        for (var index = 0; index < this.allSubItems.length; index++) {
            this.allSubItems[index].style.display = 'none';
        }
    };
    /**
     * Remove displayed options
     */
    removeAllOptions() {
        this.parent.examples.hideExamples();
        this.removeAllSubItems();

        for (var index = 0; index < this.allToDisplay.length; index++) {
            var a = this.allToDisplay[index];
            if (a.style.display == 'block') {
                a.style.display = 'none';
            }
        }
        for (var index = 0; index < this.allToDisplayBig.length; index++) {
            var b = this.allToDisplayBig[index];
            if (b.style.display == 'block') {
                b.style.display = 'none';
            }
        }
    };

    /**
     * Hide the canvas and display JS editor
     */
    resizeBigJsEditor() {
        if (this.navBarMobile.offsetHeight > 0) {
            this.removeAllOptions();
            this.canvasZoneElement.style.width = '0';
            this.switchWrapper.style.left = "";
            this.switchWrapper.style.right = "0";
            this.switchWrapperCode.style.display = 'none';
            this.fpsLabelElement.style.display = 'none';
            this.jsEditorElement.style.width = '100%';
            this.jsEditorElement.style.display = 'block';
            if (document.getElementsByClassName('gutter-horizontal').length > 0) document.getElementsByClassName('gutter-horizontal')[0].style.display = 'none';
            this.switchWrapperCanvas.style.display = 'block';
        }
    };
    /**
     * Hide the JS editor and display the canvas
     */
    resizeBigCanvas() {
        if (this.navBarMobile.offsetHeight > 0) {
            this.removeAllOptions();
            this.jsEditorElement.style.width = '0';
            this.jsEditorElement.style.display = 'none';
            document.getElementsByClassName('gutter-horizontal')[0].style.display = 'none';
            this.switchWrapperCanvas.style.display = 'none';
            this.canvasZoneElement.style.width = '100%';
            this.switchWrapper.style.left = "0";
            this.switchWrapper.style.right = "";
            this.switchWrapperCode.style.display = 'block';
            this.fpsLabelElement.style.display = 'block';
        }
    };
    /**
     * When someone resize from mobile to large screen version
     */
    resizeSplitted() {
        this.removeAllOptions();
        this.jsEditorElement.style.width = '50%';
        this.jsEditorElement.style.display = 'block';
        document.getElementsByClassName('gutter-horizontal')[0].style.display = 'block';
        this.switchWrapperCanvas.style.display = 'block';
        this.canvasZoneElement.style.width = '50%';
        this.switchWrapperCode.style.display = 'block';
        this.fpsLabelElement.style.display = 'block';
    };

    /**
     * Canvas full page
     */
    goFullPage() {
        var canvasElement = document.getElementById("renderCanvas");
        canvasElement.style.position = "absolute";
        canvasElement.style.top = 0;
        canvasElement.style.left = 0;
        canvasElement.style.zIndex = 100;
    };
    /**
     * Canvas exit full page
     */
    exitFullPage() {
        document.getElementById("renderCanvas").style.position = "relative";
        document.getElementById("renderCanvas").style.zIndex = 0;
    };
    /**
     * Canvas full screen
     */
    goFullscreen(engine) {
        engine.switchFullscreen(true);
    };
    /**
     * Editor full screen
     */
    editorGoFullscreen() {
        var editorDiv = document.getElementById("jsEditor");
        if (editorDiv.requestFullscreen) {
            editorDiv.requestFullscreen();
        } else if (editorDiv.mozRequestFullScreen) {
            editorDiv.mozRequestFullScreen();
        } else if (editorDiv.webkitRequestFullscreen) {
            editorDiv.webkitRequestFullscreen();
        }

    };

    /**
     * Display the metadatas form
     */
    displayMetadata() {
        this.removeAllOptions();
        document.getElementById("saveLayer").style.display = "block";
    };

    /**
     * Navigation Overwrites
     */
    // TO DO - Apply this when click on TS / JS button
    // TO DO - Make it work with all sizes
    exitPrompt(e) {
        var safeToggle = document.getElementById("safemodeToggle1280");
        if (safeToggle.classList.contains('checked')) {
            e = e || window.event;
            var message =
                'This page is asking you to confirm that you want to leave - data you have entered may not be saved.';
            if (e) {
                e.returnValue = message;
            }
            return message;
        }
    };

    // TO DO - Make it work with all sizes
    showQRCodes() {
        for (var i = 0; i < this.parent.utils.multipleSize.length; i++) {
            $("#qrCodeImage" + this.parent.utils.multipleSize[i]).empty();
            var playgroundCode = window.location.href.split("#");
            playgroundCode.shift();
            $("#qrCodeImage" + this.parent.utils.multipleSize[i]).qrcode({ text: "https://playground.babylonjs.com/frame.html#" + (playgroundCode.join("#")) });
        }
    };

    /**
     * When running code, display the loader
     */
    showBJSPGMenu() {
        var headings = document.getElementsByClassName('category');
        for (var i = 0; i < headings.length; i++) {
            headings[i].style.visibility = 'visible';
        }
    };
};