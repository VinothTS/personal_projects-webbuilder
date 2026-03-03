export const themes = {
  modern: {
    name: "Modern & Clean",
    layout: "grid",
    cardStyle: "shadow-md hover:shadow-xl",
    colors: {
      primary: "#2d5016",
      secondary: "#8fbc5a",
      accent: "#f4a460"
    }
  },
  elegant: {
    name: "Elegant & Professional",
    layout: "list",
    cardStyle: "border-2 hover:border-primary",
    colors: {
      primary: "#1a365d",
      secondary: "#4a5568",
      accent: "#d69e2e"
    }
  },
  vibrant: {
    name: "Vibrant & Colorful",
    layout: "masonry",
    cardStyle: "shadow-lg hover:scale-105",
    colors: {
      primary: "#c53030",
      secondary: "#ed8936",
      accent: "#38b2ac"
    }
  },
  minimal: {
    name: "Minimal & Simple",
    layout: "grid",
    cardStyle: "border hover:shadow-md",
    colors: {
      primary: "#000000",
      secondary: "#4a5568",
      accent: "#718096"
    }
  },
  classic: {
    name: "Classic & Traditional",
    layout: "grid",
    cardStyle: "shadow-sm hover:shadow-md",
    colors: {
      primary: "#2c5282",
      secondary: "#2d3748",
      accent: "#975a16"
    }
  }
};

export type ThemeName = keyof typeof themes;
