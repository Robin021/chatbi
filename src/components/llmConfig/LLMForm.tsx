import type React from "react"
import {
  Form,
  Input,
  InputNumber,
  AutoComplete,
  Button,
  Card,
  Row,
  Col,
  Divider,
  Typography,
  Tooltip,
  Switch,
} from "antd"
import {
  SaveOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  LockOutlined,
  LinkOutlined,
  SettingOutlined,
} from "@ant-design/icons"
import type { LLMRecord } from "@/utils/pocketbase/collections/type"
import { llmController } from "@/utils/pocketbase/collections/llmController"
import { getAuthenticatedUser } from "@/utils/pocketbase"

const { Text, Title } = Typography

interface LLMFormProps {
  llm?: LLMRecord | null
  onClose: () => void
  onRefresh: () => void
}

const commonModels = [
  { value: "gpt-4o-mini" },
  { value: "deepseek-v3" },
  { value: "deepseek-r1" },
  { value: "qwen-turbo" },
  { value: "qwen-max" },
]

export const LLMForm: React.FC<LLMFormProps> = ({ llm, onClose, onRefresh }) => {
  const [form] = Form.useForm()

  const onFinish = async (values: LLMRecord) => {
    if (llm) {
      await llmController.update(llm.id, values)
    } else {

      const userId = getAuthenticatedUser()?.id
      if (!userId) throw 'Not logged in'
      await llmController.create({...values, owner: [userId]})
    }
    onRefresh()
    onClose()
  }

  return (
      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={llm || {}} requiredMark="optional">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="model"
              label='Model'           
              tooltip="Enter or select the AI model you want to use"
              rules={[{ required: true, message: "Please input the model!" }]}
            >
              <AutoComplete
                options={commonModels}
                filterOption={(inputValue, option) =>
                  option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
              >
                <Input placeholder="Enter or select a model" />
              </AutoComplete>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="apiKey"
              label={
                <span>
                  API Key <LockOutlined />
                </span>
              }
              rules={[{ required: true, message: "Please input the API Key!" }]}
            >
              <Input.Password placeholder="Enter your API key" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="baseURL"
              label={
                <span>
                  Base URL <LinkOutlined />
                </span>
              }
              rules={[
                { required: true, message: "Please input the Base URL!" },
                { type: "url", message: "Please enter a valid URL!" },
              ]}
            >
              <Input addonBefore="https://" placeholder="api.openai.com/v1" />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Advanced Settings</Divider>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="maxTokens"
              label="Max Tokens"
              rules={[{ required: true, message: "Please input the Max Tokens!" }]}
            >
              <InputNumber min={1} max={100000} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="temperature"
              label='Temperature'
              tooltip='Controls randomness: Lowering results in less random completions. As the temperature approaches zero, the model will become deterministic and repetitive.'
              rules={[{ required: true, message: "Please input the Temperature!" }]}
            >
              <InputNumber min={0} max={1} step={0.1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" icon={<SaveOutlined />} htmlType="submit" block>
            {llm ? "Update LLM Configuration" : "Create LLM Configuration"}
          </Button>
        </Form.Item>
        <Text type="secondary">
        Note: Ensure you have the necessary permissions to use the selected model and API key.
      </Text>
      </Form>

     
  )
}

