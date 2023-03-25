import requests

data = {
    "uuid": "7899190d-7111-441a-a69d-1e3ec0554cdd",
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