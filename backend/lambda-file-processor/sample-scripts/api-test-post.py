import requests

data = {
    "uuid": "a013371f-e037-4136-b84f-b276b95635c3",
    "username": "Tommy",
    "prompt": "headbanging",
    "result": ""
}


postresult = requests.post('https://xdg792fpxd.execute-api.us-east-1.amazonaws.com/dev/dare', json=data)

print('Post Result: {}'.format(postresult))


getresult = requests.get('https://xdg792fpxd.execute-api.us-east-1.amazonaws.com/dev/dare/{}'.format(data['uuid']))

print('Get Result: {}'.format(getresult))

print(getresult.content)

# ,
# "ProjectionExpression":"LastPostDateTime, Message, Tags",
# "ConsistentRead": true,
# "ReturnConsumedCapacity": "TOTAL"