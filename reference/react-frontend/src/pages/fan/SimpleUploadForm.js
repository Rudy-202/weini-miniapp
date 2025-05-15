import React from 'react';

const SimpleUploadForm = () => {
  // 使用最简单的HTML表单，不使用任何React状态管理
  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>最简单的文件上传表单</h1>
      <p>此表单使用最基本的HTML表单元素，直接提交到服务器</p>

      {/*
        注意：此表单使用传统的表单提交方式，会导致整个页面刷新
        action属性直接指向API端点
      */}
      <form
        action="/api/fan/tasks/test-task-id/submit"
        method="POST"
        encType="multipart/form-data"
        style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '5px' }}
      >
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="nickname" style={{ display: 'block', marginBottom: '5px' }}>
            昵称:
          </label>
          <input
            type="text"
            id="nickname"
            name="nickname"
            defaultValue="测试用户"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="invite_code" style={{ display: 'block', marginBottom: '5px' }}>
            邀请码:
          </label>
          <input
            type="text"
            id="invite_code"
            name="invite_code"
            defaultValue="TEST123"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="comment" style={{ display: 'block', marginBottom: '5px' }}>
            备注:
          </label>
          <textarea
            id="comment"
            name="comment"
            defaultValue="测试提交"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              minHeight: '80px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="images" style={{ display: 'block', marginBottom: '5px' }}>
            上传图片文件:
          </label>
          <input
            type="file"
            id="images"
            name="images"
            multiple
            accept="image/*"
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9'
            }}
          />
          <p style={{ margin: '5px 0 0', fontSize: '12px', color: '#666' }}>
            可以选择多个图片文件
          </p>
        </div>

        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          提交表单
        </button>
      </form>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f6ffed', borderRadius: '4px' }}>
        <h3>说明</h3>
        <p>
          此表单使用传统的HTML表单提交方式，不使用JavaScript。提交后，浏览器会直接向服务器发送multipart/form-data请求，
          并且整个页面会刷新。这是最基本的文件上传方式，如果此方法也不起作用，可能是服务器端的问题。
        </p>
      </div>
    </div>
  );
};

export default SimpleUploadForm;
