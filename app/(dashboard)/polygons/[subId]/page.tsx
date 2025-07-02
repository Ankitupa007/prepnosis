import React from "react"

const SingleSubjectPolygonAnalysis = ({ params }: { params: Promise<{ subId: string }> }) => {
  const { subId } = React.use(params)
  return (
    <main>
      {subId}
    </main>
  )
}

export default SingleSubjectPolygonAnalysis