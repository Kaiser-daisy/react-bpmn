/*
 * @Description:
 * @Author: lishuai
 * @Date: 2021-03-11 17:09:13
 * @LastEditTime: 2021-04-09 10:30:18
 */
export default [
  {
    path: '/',
    component: '../layouts/BlankLayout',
    routes: [
      {
        path: '/user',
        component: '../layouts/UserLayout',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './User/login',
          },
        ],
      },
      {
        path: '/',
        component: '../layouts/SecurityLayout',
        routes: [
          {
            path: '/',
            component: '../layouts/BasicLayout',
            authority: ['admin', 'user'],
            routes: [
              {
                path: '/',
                redirect: '/list',
              },
              {
                name: '流程管理',
                icon: 'table',
                path: '/list',
                component: './TableList',
              },
              {
                name: '流程设计',
                icon: 'table',
                path: '/list/design/:id',
                component: './TableList/components',
                hideInMenu: true,
              },
              {
                component: './404',
              },
            ],
          },
          {
            component: './404',
          },
        ],
      },
    ],
  },
  {
    component: './404',
  },
];
