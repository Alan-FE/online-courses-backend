
module.exports = {
    transform: function transform(array) {
        let nestedArrayContent;

        if(array[0].content !== null) {
            let arrayOfStringsContent = array[0].content.split(",");
            nestedArrayContent = arrayOfStringsContent;
        };

        array[0].content = nestedArrayContent;

        return array; 
    }
};