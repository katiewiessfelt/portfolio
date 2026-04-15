am5.ready(function () {
  // Create root element
  const root = am5.Root.new("chartdiv");

  // Set theme
  root.setThemes([am5themes_Animated.new(root)]);

  var container = root.container.children.push(
    am5.Container.new(root, {
      width: am5.percent(100),
      height: am5.percent(100),
      layout: root.verticalLayout,
    }),
  );

  // Create ForceDirected series
  const series = container.children.push(
    am5hierarchy.ForceDirected.new(root, {
      downDepth: 1,
      initialDepth: 1,
      topDepth: 0,
      valueField: "value",
      categoryField: "name",
      childDataField: "children",
      colors: am5.ColorSet.new(root, {
        // manually set line & border colors
        colors: [
          am5.color(0x00ffff), // cyan
          am5.color(0xff7700), // orange
          am5.color(0xffff00), // yellow
          am5.color(0x00ff00), // green
          am5.color(0x8a2be2), // purple
          am5.color(0x0000ff), // blue
          am5.color(0xff00ff), // pink
        ],
      }),
      xField: "x",
      yField: "y",

      // physics tuning (optional but helps)
      minRadius: 30,
      manyBodyStrength: -40,
    }),
  );

  // set the color of all children nodes to parent node
  series.circles.template.adapters.add("fill", (fill, target) => {
    const data = target.dataItem?.dataContext;

    if (data?.image) {
      return am5.color(0x000000); // if node has image, background should be black
    }

    let dataItem = target.dataItem;

    while (dataItem) {
      const data = dataItem.dataContext;
      if (data?.color) {
        return am5.color(data.color);
      }
      dataItem = dataItem.get("parent");
    }

    return fill;
  });

  // if there is an image, do not display the text
  series.labels.template.adapters.add("text", (text, target) => {
    const data = target.dataItem?.dataContext;
    return data?.image ? "" : text;
  });

  // Set up node labels
  series.labels.template.setAll({
    fill: am5.color(0x000000),
    centerX: am5.percent(50),
    centerY: am5.percent(50),
    textAlign: "center",
  });

  // hide tooltips
  series.nodes.template.set("tooltip", undefined);

  series.nodes.template.setAll({
    tooltipText: "",
  });

  function showSidebar(data) {
    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("sidebar-content");

    let html = `<h3 style="text-align: center;">Experience</h3>`;

    if (data.image) {
      html += `<img src="${data.image}" style="height: 100px; display:block;margin:10px auto;" />`;
    }

    if (data.experience) {
      html += `<h4 style="text-align: center;">${data.name}</h4>`;
      html += `<ul>`;

      data.experience.forEach((record) => {
        let years = "";
        if (record.years) {
          years =
            record.years === 1
              ? ` (${record.years} yr)`
              : ` (${record.years} yrs)`;
        }
        html += `<li>`;
        if (record.link) {
          html += `<a href="${record.link}">${record.label}${years}</a>`;
        } else {
          html += `<div>${record.label}${years}</div>`;
        }
        html += `</li>`;
      });
    }

    content.innerHTML = html;
    sidebar.classList.add("open");
  }

  series.nodes.template.events.on("click", (ev) => {
    const data = ev.target.dataItem.dataContext;
    if (!data.image) {
      return;
    }
    showSidebar(data);
  });

  series.nodes.template.setAll({
    cursorOverStyle: "pointer",
  });

  // Use template.setup function to prep up node with an image
  series.nodes.template.setup = function (target) {
    target.events.on("dataitemchanged", function (ev) {
      const data = ev.target.dataItem.dataContext;

      if (data && data.image) {
        target.children.clear(); // ✅ prevent duplicates

        var icon = target.children.push(
          am5.Picture.new(root, {
            width: 70,
            height: 70,
            centerX: am5.percent(50),
            centerY: am5.percent(50),
            src: data.image,
          }),
        );
      }
    });
  };

  //   Fetch data from Express backend
  fetch("/api/skills-graph")
    .then((res) => res.json())
    .then((data) => {
      data.x = am5.percent(50);
      data.y = am5.percent(50);

      // IMPORTANT: must be wrapped in array
      series.data.setAll([data]);

      // optional: focus root node
      series.set("selectedDataItem", series.dataItems[0]);
    })
    .catch((err) => {
      console.error("Failed to load graph data:", err);
    });
});
