const Loading = ({loadingText}) => {
    return (
        <>
            <div className="text-center">
                <span className="loading loading-spinner text-primary"></span>
                <h5>{loadingText}</h5>
            </div>
        </>
    )
}
export default Loading