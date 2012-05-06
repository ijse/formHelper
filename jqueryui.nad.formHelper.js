( function($) {
	
	$.widget("nad.formHelper", {
		/**
		 * Form Helper
		 *
		 * @author: liyi
		 * @version: 0.1-alpha
		 * @date: 2012-05-05
		 */
		
		// These options will be used as defaults
		options: {
			dataUrl: undefined, 	// Form fields data from url
			action: "", 			// Form submit to url
			defaults: {}, 			// Default value of the form's fields
			resetBtn: "input[type='reset']",
			submitBtn: "input[type='submit']",
			ajaxOptions: {
				dataType: "json",
				type: "post"
			} 						// Params send when request data from remote
		},
		
		// Private, form default values for form reset
		_defaultValues: null,
		_resetBtn: null,
		_submitBtn: null,
		
		// Set up the widget
		_create: function() {
			var me = this;
			
			me._resetBtn = me.element.find(me.options.resetBtn);
			me._submitBtn = me.element.find(me.options.submitBtn);
			
			// Bind event to reset button
			$(me._resetBtn).bind("click", function(event) {
				me.reset();
				// Trigger reset form event
				me._trigger("formreset", null, me._defaultValues);
				return false;
			});
			$(me._submitBtn).bind("click", function(event) {
				// Trigger submit form event
				me._trigger("formsubmit", null, me.getValues());
			})
			
			// Cache default values for form reset
			me._defaultValues = me.getValues();
			me._defaultValues = $.extend(me._defaultValues, me.options.defaults);
			
			// Apply default data to form fields
			me._fill(me.options.defaults);

			// Request data from remote if dataUrl
			if(me.options.dataUrl) {
				var suc = me.options.ajaxOptions.success;
				this._ajaxFill($.extend({
					url: me.options.dataUrl
				}, me.options.ajaxOptions, {
					success: function(data, textStatus) {
						if(typeof suc === "function") {
							suc.apply(this, arguments);
						}
						// Cache default values for form reset
						me._defaultValues = $.extend(me._defaultValues, data);
					}
				}));	
			}
		},
		/**
		 * Respond to changes to options
		 * @param key 
		 * @param value
		 */
		_setOption: function(key, value) {
			$.Widget.prototype._setOption.apply(this, arguments);
			this._super("_setOption", key, value);
			switch(key) {
				case "defaults":
					// Update default form values
					this._defaultValues = value; 
					break;
				case "resetBtn":
					this._resetBtn = this.element.find($(value));
					break;
				case "submitBtn":
					this._submitBtn = this.element.find($(value));
					break;
			}
		},
		
		/**
		 * Clean up any modifications formHelper has made to the DOM
		 */
		destroy: function() {
			$.Widget.prototype.destroy.call(this);
			// Unbind events
			this._resetBtn.unbind("click");
			this._submitBtn.unbind("click");
		},
		
		// Public methods
		/**
		 * Reset form fields
		 */
		reset: function() {
			this._fill(this._defaultValues);
			this._trigger("formreset", null, this._defaultValues);
		},
		submit: function() {
			// TODO:
			
		}, 
		/**
		 * Fill the form with given values or by ajax
		 * @param values object
		 * @param ajaxOptions object, optional
		 */
		fillForm: function(values, ajaxOptions) {
			if(!!values) {
				this._fill(values);
			} else {
				// fill with defaults
				this._fill(this.options.defaults);
			}
			if(!!ajaxOptions) {
				this._ajaxFill(ajaxOptions);
			}
		},
		/**
		 * Get form serialize string
		 * @return string
		 */
		serialize: function() {
			return $(this.element).serialize();
		},
		
		/**
		 * Get form serialize array object
		 * @return type {name: xxx, value: xxx}
		 */
		serializeArray: function() {
			return $(this.element).serializeArray();
		},
		/**
		 * Get field value
		 * 
		 * @param names array, field name, when not given, return all values
		 * @return object
		 */
		getValues: function(names) {
			var obj = {};
			var objarr = $(this.element).serializeArray();
			for(var i in objarr) {
				var ovalue = objarr[i];
				if( typeof obj[ovalue.name] !== "undefined") {
					var t = obj[ovalue.name];
					obj[ovalue.name] = [];
					obj[ovalue.name].push(t);
					obj[ovalue.name].push(ovalue.value);
				} else {
					obj[ovalue.name] = ovalue.value;
				}
			}
			if(!names) {
				return obj;
			} else {
				var pobj = {};
				$($.makeArray(names)).each(function(i, n) {
					pobj[n] = obj[n];
				});
				return pobj;
			}
		},
		
		// Private methods
		/**
		 * Fill form with remote data
		 * @param ajaxParams
		 */
		_ajaxFill: function(ajaxParams) {
			var me = this;
			var suc = ajaxParams.success;
			var err = ajaxParams.error;
			$.ajax($.extend(ajaxParams, {
				success: function(data, textStatus) {
					me._fill(data);
					if(typeof suc === "function") {
						suc.apply(this, arguments);
					}
					me._trigger("ajaxfill", null, data);
				},
				error: function(xhr, textStatus, errorThrown) {
					if( typeof err === "function") {
						err.apply(this, arguments);
					}
					throw new Error("jquery.formHelper Ajax Exception:" + errorThrown);
				}
			}));
		},
		/**
		 * Fill form with given data
		 * @param params
		 */
		_fill: function(params) {
			for(var i in params) {
				var va = params[i];
				var field = $(this.element).find("[name='" + i + "']");
				if(field.length > 0) {
					var ftype = field[0].type;
					if($.inArray(ftype, ["radio", "checkbox"]) !== -1) {
						// Clear fields
						field.each(function(field_index, field_value) {
							$(field_value).removeAttr("checked");
						});
						// Apply data
						$($.makeArray(va)).each(function(va_index, va_value) {
							field.each(function(field_index, field_value) {
								if(field_value.value == va_value) {
									$(field_value).attr("checked", "checked");
								}
							});
						});
					} else if($.inArray(ftype, ["select-one", "select-multiple"]) !== -1) {
						// Clear fields
						field.find("option").each(function(field_index, field_value) {
							$(field_value).removeAttr("selected");
						});
						// Apply data
						$($.makeArray(va)).each(function(va_index, va_value) {
							field.find("option").each(function(field_index, field_value) {
								if(field_value.value == va_value) {
									$(field_value).attr("selected", "selected");
								}
							});
						});
					} else { // text, password, textarea, hidden, submit, reset, image
						field.val(va);
					}
					// if
				} // if
			} // for
			// Trigger "formfiled" event
			this._trigger("formfilled", null, this);
		}
	});
}(jQuery));
