"use client"

import * as React from "react"
import { PageError } from "@workspace/ui/components/page-error"

interface AppErrorBoundaryState {
  error: Error | null
}

export interface AppErrorBoundaryProps {
  children: React.ReactNode
}

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error }
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    if (this.state.error) {
      return <PageError onRetry={this.reset} />
    }

    return this.props.children
  }
}
