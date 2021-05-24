import React, { useEffect, useState } from 'react';
import { Table } from 'antd';
import { Link } from 'umi';
import request from 'umi-request';
import { PageContainer } from '@ant-design/pro-layout';

const TableList = () => {
  const [list, setList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const response = await request('/api/processList', {
        method: 'get',
      });
      setList(response.data);
    };
    fetchData();
  }, []);
  const columns = [
    {
      title: '流程名称',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'desc',
      valueType: 'textarea',
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => {
        return <Link to={`/list/design/${record.id}`}>流程设计</Link>;
      },
    },
  ];
  return (
    <PageContainer>
      <Table rowKey="id" columns={columns} dataSource={list} />
    </PageContainer>
  );
};

export default TableList;
