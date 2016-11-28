/**
 * Created by Sean on 11/28/16.
 */
$(function () {
    $(document).ready(function() {
        try {
            $.ajax("/retrieve", {type:"POST", dataType: "json", success: function(data) {
                generateTable(data["result"]["course"], "#coursesInputTable", "table table-bordered table-condensed");
                generateTable(data["result"]["room"], "#roomsInputTable", "table table-bordered table-condensed");
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    });

    function generateTable(data, id, tableClass) {
        var columns = [];
        Object.keys(data[0]).forEach(function (title) {
            columns.push({
                head: title, //.split("_")[1]
                cl: title,
                html: function (d) {
                    return d[title]
                }
            });
        });
        var container = d3.select(id);
        container.html("");
        container.selectAll("*").remove();
        var table = container.append("table").attr("class", tableClass);

        table.append("thead").append("tr")
            .selectAll("th")
            .data(columns).enter()
            .append("th")
            .attr("class", function (d) {
                try{
                    if (orderExists(d["head"])) {
                        return "selectedOrder";
                    }
                } catch(err){
                    //
                }
            })
            .attr("style", "padding-right: 20px")
            .text(function (d) {
                return d["head"]
            });

        table.append("tbody")
            .selectAll("tr")
            .data(data).enter()
            .append("tr")
            .selectAll("td")
            .data(function (row, i) {
                return columns.map(function (c) {
                    // compute cell values for this specific row
                    var cell = {};
                    d3.keys(c).forEach(function (k) {
                        cell[k] = typeof c[k] == "function" ? c[k](row, i) : c[k];
                    });
                    return cell;
                });
            }).enter()
            .append("td")
            .html(function (d) {
                return d["html"]
            })
            .attr("class", function (d) {
                return d["cl"]
            });
    }


    $("#selectSchedulize").click(function () {
        try {
            $.ajax("/input/room", {type:"POST", data: JSON.stringify(roomsSelected), contentType: "application/json", dataType: "json", success: function(data) {
                alert("done");
            }}).fail(function (e) {
                spawnHttpErrorModal(e)
            });
        } catch (err) {
            spawnErrorModal("Query Error", err);
        }
    });

    function spawnHttpErrorModal(e) {
        $("#errorModal .modal-title").html(e.status);
        $("#errorModal .modal-body p").html(e.statusText + "</br>" + e.responseText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }

    function spawnErrorModal(errorTitle, errorText) {
        $("#errorModal .modal-title").html(errorTitle);
        $("#errorModal .modal-body p").html(errorText);
        if ($('#errorModal').is(':hidden')) {
            $("#errorModal").modal('show')
        }
    }
});