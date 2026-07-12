import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@workspace/ui-shadcn/components/card"
import { Button } from "@workspace/ui-shadcn/components/button"

export function TestCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Test</CardTitle>
      </CardHeader>
      <CardContent>Content</CardContent>
      <CardFooter className="border-t px-6 py-4">
        <Button>Save</Button>
      </CardFooter>
    </Card>
  )
}
