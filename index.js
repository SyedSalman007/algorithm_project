var started = true;
var option = false;
var points = [];
var result = [];
var timeTaken = 0;
var startTime = 0;
var endTime = 0;

$("#pointsContainer").hide();
$("#input_points").hide();
$("#convex").hide();
$("#convex_div").hide();
$("#option_selection").hide();

$(document).one("keypress", function () {
  if (started) {
    $("#main_div").hide();
    $("#option_selection").show();
    option = true;

    if (option) {
      setTimeout(function () {
        activateOption();
      }, 500);
    }

    started = false;
  }
});

function activateOption() {
  $(document).keypress(function (event) {
    var optionSelected = event.key.toLowerCase();
    $("#option_selection").hide();
    if (optionSelected == "a") {
      alert("Selected A");
    } else if (optionSelected == "b") {
      $("#convex_div").show();
    } else {
      alert("Invalid Option");
    }
    option = false;

    $(document).off("keypress");
  });
}

function takePoints() {
  var total = $("#num_points").val();
  if (total >= 0) {
    // $("#convex").show();
    $("#input_points").show();
    takeInputThroughClick(total);
    $("#point_submit").hide();

    $(document).one("keypress", function (event) {
      var theKey = event.key.toLowerCase();
      $("#convex").hide();

      switch (theKey) {
        case "a":
          startTime = performance.now();
          convexHullBruteForce(points);
          endTime = performance.now();
          timeTaken = endTime - startTime;
          console.log(`Time taken: ${timeTaken} milliseconds`);

          setTimeout(() => {
            displayBoundaryPoints();
          }, 500);

          break;
        case "b":
          startTime = performance.now();
          jarvisMarch(points, total);
          endTime = performance.now();
          timeTaken = endTime - startTime;
          console.log(`Time taken: ${timeTaken} milliseconds`);

          setTimeout(() => {
            displayBoundaryPoints();
          }, 500);

          break;
        case "c":
          startTime = performance.now();
          grahamScan(points, total);
          endTime = performance.now();
          timeTaken = endTime - startTime;
          console.log(`Time taken: ${timeTaken} milliseconds`);

          setTimeout(() => {
            displayBoundaryPoints();
          }, 500);

          break;
        case "d":
          startTime = performance.now();
          printHull(points, total);
          endTime = performance.now();
          timeTaken = endTime - startTime;
          console.log(`Time taken: ${timeTaken} milliseconds`);

          setTimeout(() => {
            displayBoundaryPoints();
          }, 500);

          break;
        case "e":
          startTime = performance.now();
          result = chansAlgorithm(points);
          endTime = performance.now();
          timeTaken = endTime - startTime;
          console.log(`Time taken: ${timeTaken} milliseconds`);

          setTimeout(() => {
            displayBoundaryPoints();
          }, 500);

          break;

        default:
          alert("Invalid Option:");
      }
    });
  } else {
    alert("Invalid Value");
  }
}

function takeInputThroughClick(limit) {
  var count = 0;

  $(document).ready(function () {
    function handleClick(event) {
      var xPos = event.pageX - $(this).offset().left;
      var yPos = event.pageY - $(this).offset().top;

      var dot = $('<div class="dot"></div>').css({
        left: xPos + "px",
        top: yPos + "px",
      });

      $("#take_input").append(dot);
      dot.fadeIn(200).fadeOut(2000, function () {
        $(this).remove();
      });

      var point = { x: xPos % 10, y: yPos % 10 };
      points.push(point);
      count++;

      if (count >= limit) {
        $("#take_input").off("click", handleClick);

        setTimeout(() => {
          $("#input_points").hide();
          $("#convex").show();
        }, 1000);
        return true;
      }
    }

    $("#take_input").on("click", handleClick);
  });
}

// .......................................  Graham Scan  .......................................

function grahamScan(points, n) {
  function nextToTop(S) {
    return S[S.length - 2];
  }

  function distSq(p1, p2) {
    return (p1.x - p2.x) * (p1.x - p2.x) + (p1.y - p2.y) * (p1.y - p2.y);
  }

  function orient(p, q, r) {
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val == 0) return 0; // collinear
    else if (val > 0) return 1; // clock wise
    else return 2; // counterclock wise
  }

  function compare(p1, p2) {
    p0 = { x: 0, y: 0 };
    let o = orient(p0, p1, p2);
    if (o == 0) {
      if (distSq(p0, p2) >= distSq(p0, p1)) return -1;
      else return 1;
    } else {
      if (o == 2) return -1;
      else return 1;
    }
  }

  let ymin = points[0].y;
  let min = 0;
  for (var i = 1; i < n; i++) {
    let y = points[i].y;

    if (y < ymin || (ymin == y && points[i].x < points[min].x)) {
      ymin = points[i].y;
      min = i;
    }
  }

  points[0], (points[min] = points[min]), points[0];

  let p0 = points[0];
  points.sort(compare);

  let m = 1;
  for (var i = 1; i < n; i++) {
    while (i < n - 1 && orient(p0, points[i], points[i + 1]) == 0) i += 1;

    points[m] = points[i];
    m += 1;
  }

  if (m < 3) return;

  let S = [];
  S.push(points[0]);
  S.push(points[1]);
  S.push(points[2]);

  for (var i = 3; i < m; i++) {
    while (true) {
      if (S.length < 2) break;
      if (orient(nextToTop(S), S[S.length - 1], points[i]) >= 2) break;
      S.pop();
    }

    S.push(points[i]);
  }

  while (S.length > 0) {
    let p = S[S.length - 1];
    var point = { x: p.x, y: p.y };
    result.push(point);
    S.pop();
  }
}

// .......................................  Jarvis March  .......................................

function jarvisMarch(points, n) {
  function orient(p, q, r) {
    let val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);

    if (val == 0) return 0;
    return val > 0 ? 1 : 2;
  }

  if (n < 3) return;

  let hull = [];

  let l = 0;
  for (let i = 1; i < n; i++) if (points[i].x < points[l].x) l = i;

  let p = l,
    q;
  do {
    hull.push(points[p]);

    q = (p + 1) % n;

    for (let i = 0; i < n; i++) {
      if (orient(points[p], points[i], points[q]) == 2) q = i;
    }

    p = q;
  } while (p != l);

  for (let temp of hull.values()) {
    var point = { x: temp.x, y: temp.y };
    result.push(point);
  }
}

// .......................................  Brute Force  .......................................

function convexHullBruteForce(point) {
  function orient(p, q, r) {
    const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
    if (val === 0) return 0;
    return val > 0 ? 1 : 2;
  }

  const n = point.length;
  if (n < 3) return point;

  const hull = [];

  let leftMost = 0;
  for (let i = 1; i < n; i++) {
    if (point[i].x < point[leftMost].x) {
      leftMost = i;
    }
  }

  let p = leftMost;
  let q;

  do {
    hull.push(point[p]);

    q = (p + 1) % n;

    for (let i = 0; i < n; i++) {
      if (orient(point[p], point[i], point[q]) === 2) {
        q = i;
      }
    }

    p = q;
  } while (p !== leftMost);

  result = hull;
}

// .......................................  Quickhull Algorithm  .......................................

let hull = new Set();

function printHull(a, n) {
  function findSide(p1, p2, p) {
    let val = (p.y - p1.y) * (p2.x - p1.x) - (p2.y - p1.y) * (p.x - p1.x);

    if (val > 0) return 1;
    if (val < 0) return -1;
    return 0;
  }

  function lineDist(p1, p2, p) {
    return Math.abs(
      (p.y - p1.y) * (p2.x - p1.x) - (p2.y - p1.y) * (p.x - p1.x)
    );
  }

  function quickHull(a, n, p1, p2, side) {
    let ind = -1;
    let max_dist = 0;

    for (let i = 0; i < n; i++) {
      let temp = lineDist(p1, p2, a[i]);
      if (findSide(p1, p2, a[i]) == side && temp > max_dist) {
        ind = i;
        max_dist = temp;
      }
    }

    if (ind == -1) {
      hull.add(p1);
      hull.add(p2);
      return;
    }

    quickHull(a, n, a[ind], p1, -findSide(a[ind], p1, p2));
    quickHull(a, n, a[ind], p2, -findSide(a[ind], p2, p1));
  }

  if (n < 3) {
    console.log("Convex hull not possible");
    return;
  }

  let min_x = 0,
    max_x = 0;
  for (let i = 1; i < n; i++) {
    if (a[i].x < a[min_x].x) min_x = i;
    if (a[i].x > a[max_x].x) max_x = i;
  }

  quickHull(a, n, a[min_x], a[max_x], 1);

  quickHull(a, n, a[min_x], a[max_x], -1);

  hull.forEach((element) => {
    var point = { x: element.x, y: element.y };
    result.push(point);
  });
}

// .......................................  Chans Algorithm  .......................................

function chansAlgorithm(points) {
  function crossProduct(p1, p2, p3) {
    return (p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x);
  }

  function findLowestPoint(points) {
    let lowest = points[0];
    for (let i = 1; i < points.length; i++) {
      if (
        points[i].y < lowest.y ||
        (points[i].y === lowest.y && points[i].x < lowest.x)
      ) {
        lowest = points[i];
      }
    }
    return lowest;
  }

  function sortByPolarAngle(referencePoint, points) {
    return points.sort((p1, p2) => {
      const angle1 = Math.atan2(
        p1.y - referencePoint.y,
        p1.x - referencePoint.x
      );
      const angle2 = Math.atan2(
        p2.y - referencePoint.y,
        p2.x - referencePoint.x
      );

      if (angle1 < angle2) return -1;
      if (angle1 > angle2) return 1;

      const dist1 =
        Math.pow(p1.x - referencePoint.x, 2) +
        Math.pow(p1.y - referencePoint.y, 2);
      const dist2 =
        Math.pow(p2.x - referencePoint.x, 2) +
        Math.pow(p2.y - referencePoint.y, 2);

      return dist1 - dist2;
    });
  }

  function convexHullGrahamScan(points) {
    if (points.length < 3) return points;

    const lowest = findLowestPoint(points);
    const sortedPoints = sortByPolarAngle(lowest, points);

    const stack = [sortedPoints[0], sortedPoints[1], sortedPoints[2]];

    for (let i = 3; i < sortedPoints.length; i++) {
      while (
        crossProduct(
          stack[stack.length - 2],
          stack[stack.length - 1],
          sortedPoints[i]
        ) <= 0
      ) {
        stack.pop();
      }
      stack.push(sortedPoints[i]);
    }

    return stack;
  }

  return convexHullGrahamScan(points);
}

// .......................................  Display Result  .......................................

function displayBoundaryPoints() {
  $(document).ready(function () {
    $("#pointsContainer").show();
    var pointsList = $("#pointsList");

    result.forEach(function (point) {
      var listItem = $("<li class='display_list'></li>").text(
        "(" + point.x + ", " + point.y + ")"
      );
      pointsList.append(listItem);
    });
    var timeDisplay = $("<p class='time_taken'></p>").text(
      "Time Taken in Execution: " + timeTaken + " milliseconds"
    );
    $("#pointsContainer").append(timeDisplay);
  });
}
// ....................................................................................................

// function showFinalResult() {
//   $("#input_points").show();
//   $(".input_zone").css("background-color", "white");
//   // Set up the SVG container inside the input_zone div
//   var svg = d3
//     .select("#take_input")
//     .append("svg")
//     .attr("width", 900)
//     .attr("height", 600);

//   // Create circles for result points
//   svg
//     .selectAll(".end_boundarry_dot")
//     .data(result)
//     .enter()
//     .append("circle")
//     .attr("class", "end_boundarry_dot")
//     .attr("cx", function (d) {
//       return d.x * 100;
//     }) // Adjust scaling for visualization
//     .attr("cy", function (d) {
//       return d.y * 100;
//     }) // Adjust scaling for visualization
//     .attr("r", 5); // Adjust the radius as needed

//   // Create a line connecting result points
//   var lineGenerator = d3
//     .line()
//     .x(function (d) {
//       return d.x * 100;
//     }) // Adjust scaling for visualization
//     .y(function (d) {
//       return d.y * 100;
//     }); // Adjust scaling for visualization

//   svg
//     .append("path")
//     .data(result)
//     .attr("class", "line")
//     .attr("d", lineGenerator)
//     .attr("fill", "none");

//   // Create circles for other points
//   svg
//     .selectAll(".end_dot")
//     .data(points)
//     .enter()
//     .append("circle")
//     .attr("class", "end_dot")
//     .attr("cx", function (d) {
//       return d.x * 100;
//     }) // Adjust scaling for visualization
//     .attr("cy", function (d) {
//       return d.y * 100;
//     }) // Adjust scaling for visualization
//     .attr("r", 5); // Adjust the radius as needed
// }
