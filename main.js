/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global define, $, brackets */

define(function (require, exports, module) {
    'use strict';

    // The CommandManager registers command IDs with functions
    var CommandManager = brackets.getModule("command/CommandManager"),
        // This will let us add menus items
        Menus          = brackets.getModule("command/Menus"),
        EditorManager = brackets.getModule("editor/EditorManager"),
        DocumentManager = brackets.getModule("document/DocumentManager"),
        Commands = brackets.getModule("command/Commands"),
        ExtensionUtils = brackets.getModule("utils/ExtensionUtils"),
        NodeDomain = brackets.getModule("utils/NodeDomain"),
        ProjectManager = brackets.getModule("project/ProjectManager"),
		StringUtils = brackets.getModule("utils/StringUtils"),
		ViewUtils = brackets.getModule("utils/ViewUtils"),
		FileUtils = brackets.getModule("file/FileUtils"),
		he = require("vendor/he");

    /*
        Some constants used by Additional right click menu       
    */
    var RIGHT_CLICK_MENU_COPY_NAME   = "Copy",
        RIGHT_CLICK_MENU_COPY_COMMAND_ID  = "rightclickmenu.copy",
        RIGHT_CLICK_MENU_PASTE_NAME   = "Paste",
        RIGHT_CLICK_MENU_PASTE_COMMAND_ID  = "rightclickmenu.paste",
        RIGHT_CLICK_MENU_CUT_NAME   = "Cut",
        RIGHT_CLICK_MENU_CUT_COMMAND_ID  = "rightclickmenu.cut",
        RIGHT_CLICK_MENU_UPPERCASE_NAME   = "UPPERCASE",
        RIGHT_CLICK_MENU_UPPERCASE_COMMAND_ID  = "rightclickmenu.uppercase",
        RIGHT_CLICK_MENU_LOWERCASE_NAME   = "lowercase",
        RIGHT_CLICK_MENU_LOWERCASE_COMMAND_ID  = "rightclickmenu.lowercase",
        RIGHT_CLICK_MENU_CAMELCASE_NAME   = "Camel Case",
        RIGHT_CLICK_MENU_CAMELCASE_COMMAND_ID  = "rightclickmenu.camelcase",
        //RIGHT_CLICK_MENU_SELECTALL_NAME   = "Select all",
        //RIGHT_CLICK_MENU_SELECTALL_COMMAND_ID  = "rightclickmenu.selectall",
        RIGHT_CLICK_MENU_BLOCKCOMMENT_NAME   = "Toggle Block Comment",
        RIGHT_CLICK_MENU_BLOCKCOMMENT_COMMAND_ID  = "rightclickmenu.blockComment",
        RIGHT_CLICK_MENU_LINECOMMENT_NAME   = "Toggle Line Comment",
        RIGHT_CLICK_MENU_LINECOMMENT_COMMAND_ID  = "rightclickmenu.lineComment",/*,
        RIGHT_CLICK_MENU_COPYFILE_NAME   = "Copy",
        RIGHT_CLICK_MENU_COPYFILE_COMMAND_ID  = "rightclickmenu.copyFile",
        RIGHT_CLICK_MENU_PASTEFILE_NAME   = "Paste",
        RIGHT_CLICK_MENU_PASTEFILE_COMMAND_ID  = "rightclickmenu.pasteFile";*/
		RIGHT_CLICK_MENU_CONVERTTO_NAME = "Convert to",
		RIGHT_CLICK_MENU_CONVERTTO_COMMAND_ID = "rightclickmenu.convertTo",
		RIGHT_CLICK_MENU_ENCODE_HTMLENTITY_NAME = "Encode HTML entity",
		RIGHT_CLICK_MENU_ENCODE_HTMLENTITY_COMMAND_ID = "rightclickmenu.encodeHTMLentity",
		RIGHT_CLICK_MENU_ENCODE_NAMEDHTMLENTITY_NAME = "Encode Named HTML entity",
		RIGHT_CLICK_MENU_ENCODE_NAMEDHTMLENTITY_COMMAND_ID = "rightclickmenu.encodeNamedHTMLentity",
		RIGHT_CLICK_MENU_DECODE_HTMLENTITY_NAME = "Decode HTML entity",
		RIGHT_CLICK_MENU_DECODE_HTMLENTITY_COMMAND_ID = "rightclickmenu.decodeHTMLentity",
		RIGHT_CLICK_MENU_ENCODE_URI_NAME = "Encode URI",
		RIGHT_CLICK_MENU_ENCODE_URI_COMMAND_ID = "rightclickmenu.encodeURI",
		RIGHT_CLICK_MENU_DECODE_URI_NAME = "Decode URI",
		RIGHT_CLICK_MENU_DECODE_URI_COMMAND_ID = "rightclickmenu.decodeURI";
	
    var Strings             = require("strings");
    
    var RIGHT_CLICK_MENU_SAVEALL_NAME   = "Save All",
        RIGHT_CLICK_MENU_SAVEALL_COMMAND_ID  = "rightclickmenu.saveAll",
        RIGHT_CLICK_MENU_UNDO_NAME   = "Undo",
        RIGHT_CLICK_MENU_UNDO_COMMAND_ID = "rightclickmenu.undo";

    var setCursorPos = false, initialPos = {};

    $('#editor-holder').mousedown(function(event) {
        var el = $(event.target);

        switch (event.which) {
            case 1:
                //alert('Left Mouse button pressed.');
                break;
            case 2:
                //alert('Middle Mouse button pressed.');
                break;
            case 3:
                //alert('Right Mouse button pressed.');
				if ($("#editor-context-menu-rightclickmenu\\.convertTo span.menu-shortcut").length === 0) {
					$("#editor-context-menu-rightclickmenu\\.convertTo").append('<span class="menu-shortcut">&rtrif;</span>');
				}
				
                if(el.find('.CodeMirror-code').length > 0){
                    var editor = EditorManager.getCurrentFullEditor(),
                        selectedText = editor.getSelectedText(),
                        li;

                    initialPos = editor.getCursorPos();
                    if(selectedText.length === 0){
                        setCursorPos = true;
                        li = $('#editor-context-menu-rightclickmenu\\.copy').parent();
                        li.hide();
                        if($('#editor-context-menu-rightclickmenu\\.copy\\.disabled').length===0){
                            $('<li>'+li.html().replace('editor-context-menu-rightclickmenu.copy', 'editor-context-menu-rightclickmenu.copy.disabled')+'</li>').insertBefore(li).find('a').css('color', '#494949');
                        }

                        li = $('#editor-context-menu-rightclickmenu\\.cut').parent();
                        li.hide();
                        if($('#editor-context-menu-rightclickmenu\\.cut\\.disabled').length===0){
                            $('<li>'+li.html().replace('editor-context-menu-rightclickmenu.cut', 'editor-context-menu-rightclickmenu.cut.disabled')+'</li>').insertBefore(li).find('a').css('color', '#494949');
                        }
						li = $('#editor-context-menu-rightclickmenu\\.convertTo').parent();
						li.hide();
                        if($('#editor-context-menu-rightclickmenu\\.convertTo\\.disabled').length===0){
                            $('<li>'+li.html().replace('editor-context-menu-rightclickmenu.convertTo', 'editor-context-menu-rightclickmenu.convertTo.disabled')+'</li>').insertBefore(li).find('a').css('color', '#494949');
                        }
						/*
                        li = $('#editor-context-menu-rightclickmenu\\.uppercase').parent();
                        li.hide();
                        if($('#editor-context-menu-rightclickmenu\\.uppercase\\.disabled').length===0){
                            $('<li>'+li.html().replace('editor-context-menu-rightclickmenu.uppercase', 'editor-context-menu-rightclickmenu.uppercase.disabled')+'</li>').insertBefore(li).find('a').css('color', '#494949');
                        }

                        li = $('#editor-context-menu-rightclickmenu\\.lowercase').parent();
                        li.hide();
                        if($('#editor-context-menu-rightclickmenu\\.lowercase\\.disabled').length===0){
                            $('<li>'+li.html().replace('editor-context-menu-rightclickmenu.lowercase', 'editor-context-menu-rightclickmenu.lowercase.disabled')+'</li>').insertBefore(li).find('a').css('color', '#494949');
                        }
                        
                        li = $('#editor-context-menu-rightclickmenu\\.camelcase').parent();
                        li.hide();
                        if($('#editor-context-menu-rightclickmenu\\.camelcase\\.disabled').length===0){
                            $('<li>'+li.html().replace('editor-context-menu-rightclickmenu.camelcase', 'editor-context-menu-rightclickmenu.camelcase.disabled')+'</li>').insertBefore(li).find('a').css('color', '#494949');
                        }
                    	*/
                    }
                    else{
                        setCursorPos = false;
                        li = $('#editor-context-menu-rightclickmenu\\.copy').parent();
                        li.show();
                        $('#editor-context-menu-rightclickmenu\\.copy\\.disabled').remove();

                        li = $('#editor-context-menu-rightclickmenu\\.cut').parent();
                        li.show();
                        $('#editor-context-menu-rightclickmenu\\.cut\\.disabled').remove();
						
                        li = $('#editor-context-menu-rightclickmenu\\.convertTo').parent();
                        li.show();
                        $('#editor-context-menu-rightclickmenu\\.convertTo\\.disabled').remove();
						/*
                        li = $('#editor-context-menu-rightclickmenu\\.lowercase').parent();
                        li.show();
                        $('#editor-context-menu-rightclickmenu\\.lowercase\\.disabled').remove();
                        
                        li = $('#editor-context-menu-rightclickmenu\\.uppercase').parent();
                        li.show();
                        $('#editor-context-menu-rightclickmenu\\.uppercase\\.disabled').remove();

                        li = $('#editor-context-menu-rightclickmenu\\.camelcase').parent();
                        li.show();
                        $('#editor-context-menu-rightclickmenu\\.camelcase\\.disabled').remove();
                        */
                    }
                }
				
				if ($('#editor-context-menu-rightclickmenu\\.convertTo\\.event').length === 0) {
					$('#editor-context-menu *[id^="editor-context-menu"]').mouseover(function(event) {
						if (this.id === "editor-context-menu-rightclickmenu.convertTo") {
							Menus.getContextMenu("convertto-context-menu").openSubMenu(event);
						} else {
							Menus.getContextMenu("convertto-context-menu").close(event);
						}
					});
					
					$('#editor-context-menu-rightclickmenu\\.convertTo').toggleClass('event');
				}
                break;
        }
    });


    /* 
        Function to copy text
    */
    function copyToClipboard() {
        document.execCommand("copy", false, null);
    }
    /* 
        Function to paste text
    */
    function pasteToEditor() {
        var editor = EditorManager.getCurrentFullEditor();
        if(setCursorPos)
            editor.setCursorPos(initialPos.line, initialPos.ch);
        document.execCommand('paste');
    }
    /* 
        Function to cut text
    */
    function cutToClipboard() {
        document.execCommand('cut');
    }
    /*
        Function to cut text
    */
  /*  function selectall() {
        document.execCommand('selectall');
    }
*/
    /*
        Function to uppercase text
    */
    function uppercase() {
        var editor = EditorManager.getCurrentFullEditor(),
            selectedText = editor.getSelectedText(),
            pos = editor.getSelection(),
            currentDoc = DocumentManager.getCurrentDocument();
        currentDoc.replaceRange(selectedText.toUpperCase(), pos.start, pos.end);
        
        editor.setSelection(pos.start, pos.end);
    }
    /*
        Function to lowercase text
    */
    function lowercase() {
        var editor = EditorManager.getCurrentFullEditor(),
            selectedText = editor.getSelectedText(),
            pos = editor.getSelection(),
            currentDoc = DocumentManager.getCurrentDocument();
        currentDoc.replaceRange(selectedText.toLowerCase(), pos.start, pos.end);
        
        editor.setSelection(pos.start, pos.end);
    }

    function camelcase(){
        var editor = EditorManager.getCurrentFullEditor(),
            selectedText = editor.getSelectedText().replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
                if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
                return index === 0 ? match.toLowerCase() : match.toUpperCase();
            }),
            pos = editor.getSelection(),
            currentDoc = DocumentManager.getCurrentDocument();
        currentDoc.replaceRange(selectedText, pos.start, pos.end);
        
        editor.setSelection(pos.start, pos.end);
    }
	
	function decodeHTMLEntity() {
		var editor = EditorManager.getCurrentFullEditor(),
			selectedText = he.decode(editor.getSelectedText()),
			pos = editor.getSelection(),
			currentDoc = DocumentManager.getCurrentDocument();
		currentDoc.replaceRange(selectedText, pos.start, pos.end);
	}
	
	function encodeHTMLEntity() {
		var editor = EditorManager.getCurrentFullEditor(),
			selectedText = he.encode(editor.getSelectedText(), {
				'encodeEverything': false,
				'useNamedReferences': false
			}),
			pos = editor.getSelection(),
			currentDoc = DocumentManager.getCurrentDocument();
		currentDoc.replaceRange(selectedText, pos.start, pos.end);
	}
	
	function encodeNamedHTMLEntity() {
		var editor = EditorManager.getCurrentFullEditor(),
			selectedText = he.encode(editor.getSelectedText(), {
				'encodeEverything': false,
				'useNamedReferences': true
			}),
			pos = editor.getSelection(),
			currentDoc = DocumentManager.getCurrentDocument();
		currentDoc.replaceRange(selectedText, pos.start, pos.end);
	}
	
	function encodeTextToURI() {
		var editor = EditorManager.getCurrentFullEditor(),
			selectedText = encodeURIComponent(editor.getSelectedText()),
			pos = editor.getSelection(),
			currentDoc = DocumentManager.getCurrentDocument();
		currentDoc.replaceRange(selectedText, pos.start, pos.end);
	}
	
	function decodeURIToText() {
		var editor = EditorManager.getCurrentFullEditor(),
			selectedText = decodeURIComponent(editor.getSelectedText()),
			pos = editor.getSelection(),
			currentDoc = DocumentManager.getCurrentDocument();
		currentDoc.replaceRange(selectedText, pos.start, pos.end);
	}

    function blockComment(){
        CommandManager.execute(Commands.EDIT_BLOCK_COMMENT);
    }

    function lineComment(){
        CommandManager.execute(Commands.EDIT_LINE_COMMENT);
    }

    function saveAll(){
        CommandManager.execute(Commands.FILE_SAVE_ALL);
    }
    
    function undo(){
        CommandManager.execute(Commands.EDIT_UNDO);
    }
    
    function copyFile(){
        var selectedFile = ProjectManager.getSelectedItem(),
            path = selectedFile.fullPath,
            copyPaste = new NodeDomain("copyPaste", ExtensionUtils.getModulePath(module, "node/copyPasteModule"));

        copyPaste.exec('copyText', path);

    }

    function pasteFile(){
        var selectedFile = ProjectManager.getSelectedItem(),
            destPath = selectedFile.isDirectory ? selectedFile.fullPath : selectedFile.parentPath,
            copyPaste = new NodeDomain("copyPaste", ExtensionUtils.getModulePath(module, "node/copyPasteModule"));

        copyPaste.exec('getCopyText', destPath, function(path, destPath){
            brackets.fs.readFile(path, 'utf8', function(err, content){
                if(err !== 0){
                }
                else{
                    brackets.fs.copyFile(path, destPath);
                }
            });
        });

    }

	function doNothing() {
		return false;
	}
	
    /*
        Register command for menu action
    */
    CommandManager.register(Strings.RIGHT_CLICK_MENU_CUT_NAME, RIGHT_CLICK_MENU_CUT_COMMAND_ID, cutToClipboard);
    CommandManager.register(Strings.RIGHT_CLICK_MENU_COPY_NAME, RIGHT_CLICK_MENU_COPY_COMMAND_ID, copyToClipboard);
    CommandManager.register(Strings.RIGHT_CLICK_MENU_PASTE_NAME, RIGHT_CLICK_MENU_PASTE_COMMAND_ID, pasteToEditor);
    CommandManager.register(Strings.RIGHT_CLICK_MENU_UPPERCASE_NAME, RIGHT_CLICK_MENU_UPPERCASE_COMMAND_ID, uppercase);
    CommandManager.register(Strings.RIGHT_CLICK_MENU_LOWERCASE_NAME, RIGHT_CLICK_MENU_LOWERCASE_COMMAND_ID, lowercase);
    CommandManager.register(Strings.RIGHT_CLICK_MENU_CAMELCASE_NAME, RIGHT_CLICK_MENU_CAMELCASE_COMMAND_ID, camelcase);
   // CommandManager.register(RIGHT_CLICK_MENU_SELECTALL_NAME, RIGHT_CLICK_MENU_SELECTALL_COMMAND_ID, selectall);
    CommandManager.register(Strings.RIGHT_CLICK_MENU_BLOCKCOMMENT_NAME, RIGHT_CLICK_MENU_BLOCKCOMMENT_COMMAND_ID, blockComment);
    CommandManager.register(Strings.RIGHT_CLICK_MENU_LINECOMMENT_NAME, RIGHT_CLICK_MENU_LINECOMMENT_COMMAND_ID, lineComment);
   
    CommandManager.register(Strings.RIGHT_CLICK_MENU_SAVEALL_NAME, RIGHT_CLICK_MENU_SAVEALL_COMMAND_ID, saveAll);
    CommandManager.register(Strings.RIGHT_CLICK_MENU_UNDO_NAME, RIGHT_CLICK_MENU_UNDO_COMMAND_ID, undo);
    //CommandManager.register(RIGHT_CLICK_MENU_COPYFILE_NAME, RIGHT_CLICK_MENU_COPYFILE_COMMAND_ID, copyFile);
    //CommandManager.register(RIGHT_CLICK_MENU_PASTEFILE_NAME, RIGHT_CLICK_MENU_PASTEFILE_COMMAND_ID, pasteFile);
	CommandManager.register(Strings.RIGHT_CLICK_MENU_CONVERTTO_NAME, RIGHT_CLICK_MENU_CONVERTTO_COMMAND_ID, doNothing);
	CommandManager.register(Strings.RIGHT_CLICK_MENU_ENCODE_HTMLENTITY_NAME, RIGHT_CLICK_MENU_ENCODE_HTMLENTITY_COMMAND_ID, encodeHTMLEntity);
	CommandManager.register(Strings.RIGHT_CLICK_MENU_ENCODE_NAMEDHTMLENTITY_NAME, RIGHT_CLICK_MENU_ENCODE_NAMEDHTMLENTITY_COMMAND_ID, encodeNamedHTMLEntity);
	CommandManager.register(Strings.RIGHT_CLICK_MENU_DECODE_HTMLENTITY_NAME, RIGHT_CLICK_MENU_DECODE_HTMLENTITY_COMMAND_ID, decodeHTMLEntity);
	CommandManager.register(Strings.RIGHT_CLICK_MENU_ENCODE_URI_NAME, RIGHT_CLICK_MENU_ENCODE_URI_COMMAND_ID, encodeTextToURI);
	CommandManager.register(Strings.RIGHT_CLICK_MENU_DECODE_URI_NAME, RIGHT_CLICK_MENU_DECODE_URI_COMMAND_ID, decodeURIToText);


    /*
        Register menu
    */
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuDivider();
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(RIGHT_CLICK_MENU_UNDO_COMMAND_ID);
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(RIGHT_CLICK_MENU_CUT_COMMAND_ID);
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(RIGHT_CLICK_MENU_COPY_COMMAND_ID);
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(RIGHT_CLICK_MENU_PASTE_COMMAND_ID);
    //Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(RIGHT_CLICK_MENU_SELECTALL_COMMAND_ID);
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuDivider();
	/*
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(RIGHT_CLICK_MENU_CAMELCASE_COMMAND_ID);
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(RIGHT_CLICK_MENU_UPPERCASE_COMMAND_ID);
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(RIGHT_CLICK_MENU_LOWERCASE_COMMAND_ID);
	*/
	Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(RIGHT_CLICK_MENU_CONVERTTO_COMMAND_ID);
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuDivider();
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(RIGHT_CLICK_MENU_BLOCKCOMMENT_COMMAND_ID);
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(RIGHT_CLICK_MENU_LINECOMMENT_COMMAND_ID);
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuDivider();
    Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU).addMenuItem(RIGHT_CLICK_MENU_SAVEALL_COMMAND_ID);
   
    //Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU).addMenuItem(RIGHT_CLICK_MENU_COPYFILE_COMMAND_ID);
    //Menus.getContextMenu(Menus.ContextMenuIds.PROJECT_MENU).addMenuItem(RIGHT_CLICK_MENU_PASTEFILE_COMMAND_ID);

    /*
        Register keybinding
    */

    //KeyBindingManager.addBinding(RIGHT_CLICK_MENU_UPPERCASE_COMMAND_ID, 'Ctrl-U');
    //KeyBindingManager.addBinding(RIGHT_CLICK_MENU_LOWERCASE_COMMAND_ID, 'Ctrl-L');
	
	var convertTo_cmenu = Menus.registerContextMenu("convertto-context-menu");
	
    convertTo_cmenu.addMenuItem(RIGHT_CLICK_MENU_UPPERCASE_COMMAND_ID);
    convertTo_cmenu.addMenuItem(RIGHT_CLICK_MENU_LOWERCASE_COMMAND_ID);
    convertTo_cmenu.addMenuItem(RIGHT_CLICK_MENU_CAMELCASE_COMMAND_ID);
    convertTo_cmenu.addMenuDivider();
	convertTo_cmenu.addMenuItem(RIGHT_CLICK_MENU_ENCODE_HTMLENTITY_COMMAND_ID);
	convertTo_cmenu.addMenuItem(RIGHT_CLICK_MENU_ENCODE_NAMEDHTMLENTITY_COMMAND_ID);
	convertTo_cmenu.addMenuItem(RIGHT_CLICK_MENU_DECODE_HTMLENTITY_COMMAND_ID);
    convertTo_cmenu.addMenuDivider();
	convertTo_cmenu.addMenuItem(RIGHT_CLICK_MENU_ENCODE_URI_COMMAND_ID);
	convertTo_cmenu.addMenuItem(RIGHT_CLICK_MENU_DECODE_URI_COMMAND_ID);
	
    convertTo_cmenu.openSubMenu = function (mouseOrLocation) {
		
		if (mouseOrLocation.target.nodeName === "A") {
			var $window = $(window),
				escapedId = StringUtils.jQueryIdEscape(this.id),
				$menuAnchor = $("#" + escapedId),
				$menuWindow = $("#" + escapedId + " > ul"),
				posTop  = parseInt($(".dropdown.context-menu.open").css("top")) + mouseOrLocation.target.offsetTop,
				posLeft = parseInt($(".dropdown.context-menu.open").css("left")) + mouseOrLocation.target.offsetWidth;

			// only show context menu if it has menu items
			if ($menuWindow.children().length <= 0) {
				return;
			}

			// adjust positioning so menu is not clipped off bottom or right
			var elementRect = {
					top:    posTop,
					left:   posLeft,
					height: $menuWindow.height() + 25,
					width:  $menuWindow.width()
				},
				clip = ViewUtils.getElementClipSize($window, elementRect);

			if (clip.bottom > 0) {
				posTop = Math.max(0, posTop - clip.bottom);
			}
			posLeft -= 5;


			if (clip.right > 0) {
				posLeft = Math.max(0, parseInt($(".dropdown.context-menu.open").css("left")) - elementRect.width + 5);
			}

			// open the context menu at final location
			$menuAnchor.addClass("open")
					   .css({"left": posLeft, "top": posTop});
		}
    };

});
