formHelper
==========

A JQueryUI plugin for enhancing form control

Feathers
--------
  1. Auto fill form or get fields value as object/map/search-string
  2. Get values through ajax and fill form
  3. Reset form to default values
  4. Some event handlers

Usage
-----
 1.Write html, a `<form>`.
 2.Apply formHelper as other JQueryUI widgets:

```javascript
    $("#myform").formHelper({
      //action: "abc.do",
    	dataUrl: "http://jsbin.com/ovuzak/6/js",
    	defaults: {
    		"username": "ijse",
    		"password": "abc",
    		"sex": "female",
    		"insterest": ["football", "tennis"],
    		"city": "Yantai",
    		"job": ["job1", "job3"],
    		"description": "Hi~ I am nothing!"
    	},
      // Events
    	ajaxfill: function() {
    		console.log(">>>", $("#s8").formHelper("getValues"));
    		console.log(">>>", $("#s8").formHelper("serialize"));
    	}
    });
```

  3.Set form values:

```javascript
    $("#myform").formHelper("fillForm", {
        "username": "user1", 
        "insterest": ["football", "basketball"]
    });
```

  4.Get form values:

```javascript
      $("#myform").formHelper("getValues");
```

  5.Other operation:
 
    * Bind events: fillform, ajaxfill
    * Get serialize form values
    * Reset form fields as default values