import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Dashboard",
        icon: Icons.HomeIcon,
        items: [],
        url: "/admin",
      },
      // {
      //   title: "Profile",
      //   url: "/profile",
      //   icon: Icons.User,
      //   items: [],
      // },
      {
        title: "Items",
        icon: Icons.Alphabet,
        items: [
          {
            title: "Board",
            url: "/admin/board",
          },
          {
            title: "Class",
            url: "/admin/class",
          },
          {
            title: "Books",
            url: "/admin/books",
          },
        ],
      },
      {
        title: "Questions",
        url: "/admin/question",
        icon: Icons.Table,
        items: [],
      },
      {
        title: "Features",
        url: "/admin/features",
        icon: Icons.FeatureIcon,
        items: [],
      },
      {
        title: "Packages",
        url: "/admin/packages",
        icon: Icons.PackageIcon,
        items: [],
      },
      {
        title: "Subscriptions",
        url: "/admin/subscriptions",
        icon: Icons.FeatureIcon,
        items: [],
      },
      {
        title: "Payments",
        url: "/admin/payments",
        icon: Icons.PaymentIcon,
        items: [],
      },
      {
        title: "Users",
        url: "/admin/users",
        icon: Icons.User,
        items: [],
      },
    ],
  },
  // {
  //   label: "OTHERS",
  //   items: [
  //     {
  //       title: "Authentication",
  //       icon: Icons.Authentication,
  //       items: [
  //         {
  //           title: "Sign In",
  //           url: "/auth/sign-in",
  //         },
  //       ],
  //     },
  //   ],
  // },
];
