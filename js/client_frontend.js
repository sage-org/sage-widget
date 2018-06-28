(function(){

    RDFaParser = {};

    RDFaParser.parseResource = function(resource,blankPrefix, graph, defaultSubject) {
        var currentUri = jQuery.uri.base().toString();
        if(currentUri.indexOf("#") != -1) {
            currentUri = currentUri.split("#")[0];
        }

        if(resource.type === 'uri') {
            if(resource.value._string.indexOf(currentUri) != -1) {
                var suffix = resource.value._string.split(currentUri)[1];
                var defaultPrefix = defaultSubject.toString();
                if(suffix != "") {
                    defaultPrefix = defaultPrefix.split("#")[0]
                }
                return {'uri': defaultPrefix+suffix};
            } else {
                var uri = resource.value._string;
                if(uri.indexOf('file:') === 0){
                    uri = defaultSubject.scheme + '://' + defaultSubject.authority + uri.replace('file:','');
                }
                return {'uri': uri};
            }
        } else if(resource.type === 'bnode') {
            var tmp = resource.toString();
            if(tmp.indexOf("_:")===0) {
                return {'blank': resource.value + blankPrefix };
            } else {
                return {'blank': "_:"+tmp};
            }

        } else if(resource.type === 'literal') {
            return {'literal': resource.toString()};
        }
    };

    RDFaParser.parseQuad = function(graph, parsed, blankPrefix, defaultSubject) {
        var quad = {};
        quad['subject'] = RDFaParser.parseResource(parsed.subject, blankPrefix, graph, defaultSubject);
        quad['predicate'] = RDFaParser.parseResource(parsed.property, blankPrefix, graph, defaultSubject);
        quad['object'] = RDFaParser.parseResource(parsed.object, blankPrefix, graph, defaultSubject);
        quad['graph'] = graph;

        return quad;
    };

    RDFaParser.parse = function(data, graph, options, callback) {
        var nsRegExp = /\s*xmlns:(\w*)="([^"]+)"\s*/i;
        var ns = {};

        // some default attributes
        ns['og'] = jQuery.uri("http://ogp.me/ns#");
        ns['fb'] = jQuery.uri("http://www.facebook.com/2008/fbml");

        var baseRegExp  = /\s*xmlns="([^"]+)"\s*/i
        var baseMatch = baseRegExp.exec(data);

        if(baseMatch != null) {
            window['rdfaDefaultNS'] = jQuery.uri(baseMatch[1]);
        }

        var tmp = data;
        var match = nsRegExp.exec(tmp);
        var index = null;
        while(match != null) {
            ns[match[1]] = jQuery.uri(match[2]);
            tmp = tmp.slice(match.index+match[0].length, tmp.length);
            match = nsRegExp.exec(tmp);
        }

        window['globalNs'] = ns;

        var rdfa = jQuery(data).rdfa();
        var parsed = rdfa.databank.triples();
        var quads = [];
        var prefix = ""+(new Date()).getTime();
        for(var i=0; i<parsed.length; i++) {
            quads.push(RDFaParser.parseQuad(graph,parsed[i],prefix, window['rdfaCurrentSubject']));
        }

        callback(null, quads);
    };

    // RDFParser
    RDFParser = {};

    RDFParser.parse = function(data, graph) {
        var parsed = jQuery().rdf().databank.load(data).triples();
        var quads = [];
        var prefix = ""+(new Date()).getTime();
        for(var i=0; i<parsed.length; i++) {
            quads.push(RDFaParser.parseQuad(graph,parsed[i],prefix, window['rdfaCurrentSubject']));
        }

        return quads;
    };

    jQuery.fn.center = function () {
        this.css("position","absolute");

        var bounds = jQuery("#client-frontend").position();
        var height = jQuery("#client-frontend").height();
        var width = jQuery("#client-frontend").width();
        this.css("top", ((height - bounds.top) / 2) + $(window).scrollTop() - (this.height()/2) + "px");
        this.css("left", ((width - bounds.left) / 2) + $(window).scrollLeft() - (this.width()/2) + "px");

        return this;
    };

    ClientFrontend = function(node,sage) {
        var html = "<div id='client-frontend' class='container'><h1><i class='fab fa-hubspot'></i> Playground</h1><br/>";
        html = html + "<div id='client-frontend-overlay'></div>"
        html = html + "<div id='client-frontend-server-title'><strong>Server :</strong></div><div id='client-frontend-server-area'></div>";
        html = html + "<div id='client-frontend-query-title'><strong>Query :</strong>\
        <div class='input-group mb-3 query-list'>\
        <div class='input-group-prepend'>\
          <button class='btn btn-outline-secondary dropdown-toggle' type='button' id='dropdownMenuButton' data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>Sample Queries</button>\
          <div class='dropdown-menu' id='queryList'>\
          </div>\
        </div>\
            <input type='text' class='form-control' id='sparql-query-desc-text' disabled/>\
        </div>\
        </div><div id='client-frontend-query-area'></div>";
        html = html + "<div id='client-frontend-menu'></div><br/>";
        html = html + "<div id='client-frontend-results-area' class='table-responsive'></div>";
        html = html + "<div id='client-frontend-footer'>";
        html = html + "<table class='table table-borderless'><tr>";
        html = html + "<td id='btn-prev'><button id='client-frontend-prev-image-placeholder' class='btn btn-primary' data-bind='click:prevResultPage'>\<</button></td>";
        html = html + "<td id='lbl-pages'><label class='rdfstore-footer-info' id='client-frontend-footer-display-pages' data-bind='text:\"Page \"+currentResultPage()+\"/\"+totalResultPages()+\", (\"+totalResults()+\" results)\"'></label></td>";
        html = html + "<td 'btn-next'><button id='client-frontend-next-image-placeholder' class='btn btn-primary' data-bind=' click:nextResultPage'>\></button></td>";
        html = html + "</tr></table>";
        html = html + "</div>";
        html = html + "</div>"; // client-frontend

        jQuery(node).append(html);
        jQuery('#client-frontend-next-image-placeholder').hide();
        jQuery('#client-frontend-prev-image-placeholder').hide();

        this.buildTemplates(node);
        this.buildServerArea();
        this.buildQueryArea();
        this.buildMenu();
        this.buildResultsArea();

        // application handler;
        this.viewModel.application = this;

        // save the root node
        this.viewModel.rootNode = node;


        this.viewModel.bindingsVariables = ko.dependentObservable(function(){
                                                                      var array = new Array();
                                                                      if(this.bindings().length === 0 || this.bindings() == null) {
                                                                          return [];
                                                                      } else {
                                                                          var sample = this.bindings()[0];
                                                                          for(var p in sample) {
                                                                              array.push(p);
                                                                          }
                                                                          return array;
                                                                      }
                                                              },this.viewModel);

        this.viewModel.bindingsArray = ko.dependentObservable(function(){
                                                                  var array = new Array();
                                                                  for(var i=0; i<this.bindings().length; i++) {
                                                                      var currentBindings = this.bindings()[i];
                                                                      var nextElement = new Array();
                                                                      for(var j=0; j<this.bindingsVariables().length; j++) {
                                                                          nextElement.push(currentBindings[this.bindingsVariables()[j]]);
                                                                      };
                                                                      array.push(nextElement);
                                                                  }
                                                                  return array;
                                                              },this.viewModel);

        ko.applyBindings(this.viewModel, jQuery(node).get(0));
    };

    ClientFrontend.prototype.buildTemplates = function(node) {

        html = "<script id='sparql-results-template' type='text/html'><table id='sparql-results-table-headers' class='table table-striped table-hover'><thead><tr>{{each bindingsVariables}}";
        html = html + "<th scope='col'>\${$value}</th>{{/each}}</tr></thead><tbody>{{each bindingsArray}}";
        html = html + "<tr class='{{if $index%2==0}}sparql-result-even-row{{else}}sparql-result-odd-row{{/if}}'>{{each $value }}{{if $value.token==='uri'}}";
        html = html + "<td><span class='rdfstore-data-value'>${$value}</span>";
        html = html + "<span class='rdfstore-data-token' style='display:none'>uri</span></td>{{else}}{{if $value.token==='literal'}}";
        html = html + "<td><span class='rdfstore-data-value'>${$value}</span>";
        html = html + "<span class='rdfstore-data-token' style='display:none'>literal</span><span class='rdfstore-data-lang'  style='display:none'>${$value.lang}</span>";
        html = html + "<span class='rdfstore-data-type'  style='display:none'>${$value.type}</span></td>{{else}}<td>";
        html = html + "<span class='rdfstore-data-value'>${$value}</span><span class='rdfstore-data-token' style='display:none'>blank</span></td>";
        html = html + "{{/if}}{{/if}}{{/each}}</tr>{{/each}}</tbody></table></script>";

        jQuery(node).append(html);

        html = "<script id='sparql-template-row' type='text/html'><td>${$item.data}</td></script>";

        jQuery(node).append(html);
    };

    ClientFrontend.prototype.buildMenu = function() {
        var html = "<div id='rdf-store-menu'>";
        html = html + "<div id='rdf-store-menu-run' class='rdf-store-menu-action'><button type='button' class='btn btn-primary' data-bind='click:submitQuery'>Execute</button><button type='button' id='copyBtn' class='btn btn-secondary' data-bind='click:copyToClipboard'>Copy results to clipboard</button><button type='button' id='loadingBtn' class='btn btn-warning' href='#' disabled><i class='fas fa-sync fa-spin'></i>&nbsp;&nbsp;Loading</button><br/><br/><span class='metadata' id='timer'></span><span class='metadata' id='httpCalls'></span><span class='metadata' id='avgImp'></span><span class='metadata' id='avgExp'></span><span class='metadata' id='avgResp'></span></div>";
        jQuery('#client-frontend-menu').append(html);
        jQuery('#loadingBtn').hide();
        jQuery('#copyBtn').hide();
        jQuery('#copyBtn').tooltip({
          trigger: 'click',
          placement: 'bottom'
        });
        var that = this;
        jQuery('#copyBtn').on('click', function(e) {
          that.setTooltip('Copied!');
          that.hideTooltip();
        });
    };

    ClientFrontend.prototype.buildServerArea = function() {
        var html = '<div class="input-group mb-3">\
        <div class="input-group-prepend">\
          <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Sage Servers</button>\
          <div class="dropdown-menu" id="datasetList">\
          </div>\
        </div>\
            <input type="text" class="form-control" id="sparql-server-text" data-bind="value:server"/>\
        </div>'
		    jQuery('#client-frontend-server-area').append(html);
		};

    ClientFrontend.prototype.buildQueryArea = function() {
        var html = "<textarea id='sparql-query-text' class='form-control'></textarea>";
        jQuery('#client-frontend-query-area').append(html);
        this.yasqe = YASQE.fromTextArea(document.getElementById('sparql-query-text'));

    };

    ClientFrontend.prototype.buildResultsArea = function() {
        var html = "<div id='client-frontend-query-results' data-bind='template:{name:\"sparql-results-template\"}'></div>";
        jQuery('#client-frontend-results-area').append(html);
    };


    ClientFrontend.prototype.showUriDialogModel = {
        create: function(viewModel, value) {
            this.value = value;
            this.viewModel = viewModel;
            this.id = "rdf-store-menu-show-uri-dialog"+(new Date().getTime());
            var html = "<div id='"+this.id+"' class='rdf-store-dialog'>";
            html = html + "<div class='rdfstore-dialog-title'><p>"+value+"</p></div>";
            html = html + "<div class='rdfstore-dialog-row'><span>URI:</span><input id='rdf-store-show-uri-value' type='text' value='"+value+"'></input></div>";
            html = html + "<div id='rdfstore-show-uri-row-options' class='rdfstore-options-row'>";

            html = html + "<div class='rdfstore-options-row-item' id='rdf-store-dialog-browse-uri' data-bind='click: browseUri'>browse</div>";
            html = html + "<div class='rdfstore-options-row-item' id='rdf-store-dialog-browse-store' data-bind='click: storeUri'>load</div>";
            html = html + "</div>";
            html = html + "<div class='rdfstore-dialog-actions'>";
            html = html + "<input type='submit' value='cancel' style='float:none; min-width:100px' data-bind='click:closeDialog'></input>";
            html = html + "</div>";
            html = html + "</div>";

            jQuery(viewModel.rootNode).append(html);
            jQuery("#"+this.id).css("min-height", "280px").css("height", "280px").center();

            ko.applyBindings(this, jQuery("#"+this.id).get(0));
            jQuery("#"+this.id).draggable({handle: "div.rdfstore-dialog-title"});
        },



        closeDialog: function() {
            // modal
            jQuery('#client-frontend-overlay').hide();

            jQuery("#"+this.id).remove();
        },

        browseUri: function() {
            window.open(this.value, "Browse: "+this.value);
        },


    };

    ClientFrontend.prototype.showLiteralDialogModel = {
        create: function(viewModel, value, lang, type) {
            this.value = value;
            this.viewModel = viewModel;
            this.id = "rdf-store-menu-show-literal-dialog"+(new Date().getTime());
            var html = "<div id='"+this.id+"' class='rdf-store-dialog'>";
            html = html + "<div class='rdfstore-dialog-title'><p>Show Literal</p></div>";
            html = html + "<div class='rdfstore-dialog-row'><span>Type:</span><input id='rdf-store-show-literal-type' type='text' value='"+type+"'></input></div>";
            html = html + "<div class='rdfstore-dialog-row'><span>Language:</span><input id='rdf-store-show-literal-language' type='text' value='"+lang+"'></input></div>";
            html = html + "<div class='rdfstore-dialog-row'><span>Value:</span><textarea id='rdf-store-show-literal-value' type='text'>"+value+"</textarea></div>";
            html = html + "<div class='rdfstore-dialog-actions' id='rdfstore-dialog-actions-show-literal'>";
            html = html + "<input type='submit' value='cancel' style='float:none; min-width:100px' data-bind='click:closeDialog'></input>";
            html = html + "</div>";
            html = html + "</div>";

            jQuery(viewModel.rootNode).append(html);
            jQuery("#"+this.id).css("min-height", "380px").css("height", "380px").center();

            ko.applyBindings(this, jQuery("#"+this.id).get(0));
            jQuery("#"+this.id).draggable({handle: "div.rdfstore-dialog-title"});
        },

        closeDialog: function() {
            // modal
            jQuery('#client-frontend-overlay').hide();

            jQuery("#"+this.id).remove();
        },

        browseUri: function() {
            window.open(this.value, "Browse: "+this.value);
        },

    };

    ClientFrontend.prototype.loadGraphDialogModel = {
        create: function(viewModel, uriToLoad) {
            // modal
            jQuery('#client-frontend-overlay').show();

            this.viewModel = viewModel;

            var html = "<div id='rdf-store-menu-load-dialog' class='rdf-store-dialog'>";
            html = html + "<div class='rdfstore-dialog-title'>Load remote graph</div>";
            if(uriToLoad) {
                html = html + "<div class='rdfstore-dialog-row'><span>Graph to load URI:</span><input id='rdf-store-graph-to-load' type='text' value='"+uriToLoad+"'></input></div>";
            } else {
                html = html + "<div class='rdfstore-dialog-row'><span>Graph to load URI:</span><input id='rdf-store-graph-to-load' type='text'></input></div>";
            }
            html = html + "<div class='rdfstore-dialog-row'><span>Store graph URI:</span><input id='rdf-store-graph-to-store' type='text'></input></div>";
            html = html + "<div class='rdfstore-dialog-actions'>";
            html = html + "<input type='submit' value='cancel' style='float:none; min-width:100px' data-bind='click:closeDialog'></input>";
            html = html + "</div>";
            html = html + "</div>";

            jQuery(viewModel.rootNode).append(html);
            jQuery("#rdf-store-menu-load-dialog").css("min-height", "180px").css("height", "180px").center();

            ko.applyBindings(this, jQuery("#rdf-store-menu-load-dialog").get(0));
            jQuery("#rdf-store-menu-load-dialog").draggable({handle: "div.rdfstore-dialog-title"});
        },

        closeDialog: function() {
            // modal
            jQuery('#client-frontend-overlay').hide();
            jQuery("#rdf-store-menu-load-dialog").remove();
            jQuery("#rdfstore-dialog-load-submit-btn").attr('disabled',false);
        },



    };

    ClientFrontend.prototype.setTooltip = function(message) {
      jQuery('#copyBtn').tooltip('hide')
      .attr('data-original-title', message)
      .tooltip('show');
      }

    ClientFrontend.prototype.hideTooltip = function() {
      setTimeout(function() {
      jQuery('#copyBtn').tooltip('hide');
      }, 1000);
    }

    ClientFrontend.prototype.viewModel = {
         rootNode: null,

         modified: true,
         lastQuery: null,


         server: ko.observable('https://sage.univ-nantes.fr/sparql/watdiv10m'),

         prevHistory: ko.observable([]),

         nextHistory: ko.observable([]),

         bindingsPerPage: ko.observable(10),

         allBindings: ko.observable([]),

         bindings: ko.observable([]),

         totalResults: ko.observable(0),

         totalResultPages: ko.observable(0),

         currentResultPage: ko.observable(0),

         prevResultPage: function() {
             var currentResultPage = this.currentResultPage();
             var maxPages = Math.ceil(this.allBindings().length / this.bindingsPerPage());
             if(currentResultPage > 1) {
                 currentResultPage = currentResultPage - 1;
                 var startBindings = (currentResultPage-1) * this.bindingsPerPage();
                 this.currentResultPage(currentResultPage);
                 this.bindings(this.allBindings().slice(startBindings, startBindings+this.bindingsPerPage()));
                 if (currentResultPage === 1) {
                   this.togglePrevPage();
                 }
                 if (currentResultPage === (maxPages - 1)) {
                   this.toggleNextPage();
                 }
             }
         },

        toggleNextPage: function() {
            jQuery('#client-frontend-next-image-placeholder').toggle();
        },

        togglePrevPage: function() {
            jQuery('#client-frontend-prev-image-placeholder').toggle();
        },

        nextResultPage: function() {
            var currentResultPage = this.currentResultPage();
            var maxPages = Math.ceil(this.allBindings().length / this.bindingsPerPage());
            if(currentResultPage<maxPages) {
                var startBindings = currentResultPage * this.bindingsPerPage();
                currentResultPage = currentResultPage + 1;
                this.currentResultPage(currentResultPage);
                this.bindings(this.allBindings().slice(startBindings, startBindings+this.bindingsPerPage()));
                if (currentResultPage === maxPages) {
                  this.toggleNextPage();
                }
                if (currentResultPage === 2) {
                  this.togglePrevPage();
                }
            }
        },

        copyToClipboard : function(){
          const el = document.createElement('textarea');
          el.value = JSON.stringify(this.allBindings(),null,2);
          el.setAttribute('readonly', '');
          el.style.position = 'absolute';
          el.style.left = '-9999px';
          document.body.appendChild(el);
          el.select();
          document.execCommand('copy');
          document.body.removeChild(el);
        },

        submitQuery: function() {
            var query = this.application.yasqe.getValue();
            var server = jQuery('#sparql-server-text').val();
            jQuery('#client-frontend-next-image-placeholder').hide();
            jQuery('#client-frontend-prev-image-placeholder').hide();
            var that = this;
            var t0 = performance.now();

            this.allBindings([]);
            this.bindings([]);
            this.totalResults(0);
            this.totalResultPages(0);
            this.currentResultPage(0);
            var metadata = {
              httpCalls : 0,
              importTotal : 0.0,
              exportTotal : 0.0
            }
            var spy = new sage.Spy();
            var client = new sage.SageRequestClient(server,spy);
            results = new sage.SparqlIterator(query, {client});
            results.on('data',function(res){
              for (var variable in res) {
                if (res[variable] === null) {
                  res[variable] = "null";
                }
              }
              that.allBindings().push(res);
              var t1 = performance.now();
              var execTime = Number(((t1 - t0)/1000).toFixed(4));
              jQuery('#timer')[0].innerText = "Execution time: " + execTime + "s";
              jQuery('#httpCalls')[0].innerText = "HTTP calls: " + spy.nbHTTPCalls;
              var avgImp = Number(spy.avgImportTime.toFixed(4));
              var avgExp = Number(spy.avgExportTime.toFixed(4));
              var avgResp = Number(spy.avgResponseTime.toFixed(0));
              jQuery('#avgImp')[0].innerText = "Average import time: " + avgImp + "ms";
              jQuery('#avgExp')[0].innerText = "Average export time: " + avgExp + "ms";
              jQuery('#avgResp')[0].innerText = "Average response time: " + avgResp + "ms";
              that.bindings(that.allBindings().slice(0,that.bindingsPerPage()));
              that.totalResultPages(Math.ceil(that.allBindings().length/that.bindingsPerPage()));
              that.totalResults(that.allBindings().length);
              that.currentResultPage(1);
              var maxPages = Math.ceil(that.allBindings().length / that.bindingsPerPage());
              if (maxPages>1) {
                jQuery('#client-frontend-next-image-placeholder').show();
              }
            });
            results.on('end',function(){
              jQuery('#loadingBtn').hide();
              jQuery('#copyBtn').show();
            })
            jQuery('#loadingBtn').show();
            jQuery('#copyBtn').hide();
        }

    };

    // parsers
    ClientFrontend.rdfaParser = RDFaParser;
    ClientFrontend.rdfParser = RDFParser;

    window['client_frontend'] = ClientFrontend;
})();
