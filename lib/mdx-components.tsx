import Image from 'next/image'
import YouTube from 'react-youtube'

const components = {
  Image: (props: any) => (
    <div className="my-8">
      <Image {...props} />
    </div>
  ),
  YouTube: ({ videoId }: { videoId: string }) => (
    <div className="video-wrapper my-8">
      <YouTube
        videoId={videoId}
        opts={{
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 0,
          },
        }}
      />
    </div>
  ),
  ContentBox: ({ children }: { children: React.ReactNode }) => (
    <div className="content-wrapper my-8">
      {children}
    </div>
  ),
}

export default components 