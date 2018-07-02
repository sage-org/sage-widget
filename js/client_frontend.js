(function(){
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
        html = html + "<tr>{{each $value }}";
        html = html + "<td><span class='rdfstore-data-value'>{{if $value.startsWith('http://') || $value.startsWith('https://')}}<a href=${$value} target='_blank'>${$value}</a>{{else}}${$value}{{/if}}</span>";
        html = html + "</td>";
        html = html + "{{/each}}</tr>{{/each}}</tbody></table></script>";


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

            var spy = new sage.Spy();
            results = new sage.SparqlIterator(query, {spy: spy},server);
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


    window['client_frontend'] = ClientFrontend;
})();
