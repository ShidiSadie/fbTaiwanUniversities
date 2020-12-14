import numpy as np
from graph_tool.all import *
from scipy.sparse import coo_matrix
import pandas as pd
import json

G = Graph(directed=False)
v_school = G.new_vertex_property("int")
v_department = G.new_vertex_property("int")
v_rclass = G.new_vertex_property("int")
v_tracking = G.new_vertex_property("int")
v_gender = G.new_vertex_property("int")
v_major1 = G.new_vertex_property("int")
v_grade = G.new_vertex_property("int")
v_discipline = G.new_vertex_property("int")
v_liveplace = G.new_vertex_property("int")
e_companion = G.new_edge_property("int")
e_message = G.new_edge_property("int")
e_like = G.new_edge_property("int")
e_weight = G.new_edge_property("double")
owner_index_mapping = {}
comment_actor_recording = []
post_bucket = {}

#add nodes
'''edges = pd.read_csv("DT_edge_Copy.csv", dtype={"comment_id":str})
fb_nodes = pd.read_csv("survey_1007.csv")
edges['OwnerFbid'] = edges['OwnerFbid'].astype('Int64')
edges['actor_id'] = edges['actor_id'].astype('Int64')
fb_nodes['OwnerFbid'] = fb_nodes['OwnerFbid'].astype('Int64')'''

edges = pd.read_csv("DT_edge_Copy.csv", usecols=['edge_type','post_id', 'actor_id', 'action_time', 'post_owner_id', 'comment_pos', 'comment_neg', 'comment_like_count'], parse_dates=['action_time'])
fb_nodes = pd.read_csv("survey_1007.csv", usecols=['OwnerFbid','school', 'department', 'rclass', 'tracking', 'gender', 'major1', 'discipline', 'grade', 'liveplace'])
'''edges = pd.read_csv("DT_edge_Copy.csv")
fb_nodes = pd.read_csv("survey_1007.csv")'''

edges['action_year'] = pd.to_datetime(edges['action_time'], format="%Y-%m-%d %H:%M:%S").dt.year
edges['action_month'] = pd.to_datetime(edges['action_time'], format="%Y-%m-%d %H:%M:%S").dt.month
edges['action_time'] = edges['action_year'].astype(str) + "-" + edges['action_month'].astype(str)
edges['post_owner_id'] = edges['post_owner_id'].astype('Int64')
edges['actor_id'] = edges['actor_id'].astype('Int64')
fb_nodes['OwnerFbid'] = fb_nodes['OwnerFbid'].astype('Int64')

'''edges['OwnerFbid'] = edges['OwnerFbid'].astype(str)
edges['actor_id'] = edges['actor_id'].astype(str)
fb_nodes['OwnerFbid'] = fb_nodes['OwnerFbid'].astype(str)'''

for i, j in fb_nodes.iterrows():
    v = G.add_vertex()
    print(G.vertex_index[v])
    owner_index_mapping[j.OwnerFbid] = G.vertex_index[v]
    print(j.OwnerFbid)
    v_school[v] = j.school
    v_department[v] = j.department
    v_rclass[v] = j.rclass
    v_tracking[v] = j.tracking
    v_gender[v] = j.gender
    v_major1[v] = j.major1
    v_discipline[v] = j.discipline
    v_grade[v] = j.grade
    v_liveplace[v] = j.liveplace

'''for v in owner_index_mapping:
    print(v)
    print(owner_index_mapping[v])'''

d = {'source': edges['actor_id'], 'action_time': edges['action_time'], 'target': edges['post_owner_id']}
d_frame = pd.DataFrame(data=d)
d_frame = d_frame.drop(d_frame[d_frame['source'] == d_frame['target']].index)
#d_frame = d_frame[(d_frame['source'].apply(lambda x: owner_index_mapping.__contains__(x))) & (d_frame['target'].apply(lambda x: owner_index_mapping.__contains__(x)))]
d_frame['source_dep'] = d_frame['source'].apply(lambda x: v_department[owner_index_mapping[x]] if owner_index_mapping.__contains__(x) else 0)
d_frame['target_dep'] = d_frame['target'].apply(lambda x: v_department[owner_index_mapping[x]] if owner_index_mapping.__contains__(x) else 0)
d_frame['source'] = d_frame['source'].apply(lambda x: owner_index_mapping[x] if owner_index_mapping.__contains__(x) else 0)
d_frame['target'] = d_frame['target'].apply(lambda x: owner_index_mapping[x] if owner_index_mapping.__contains__(x) else 0)
d_frame = d_frame.drop(d_frame[d_frame['source_dep'] == 0].index)
d_frame = d_frame.drop(d_frame[d_frame['target_dep'] == 0].index)
d_frame['count'] = 0
d_frame_inside = d_frame[d_frame['source_dep'] == d_frame['target_dep']]
#print(d_frame_inside)
d_frame_inside = d_frame_inside.drop(columns=['source_dep', 'target_dep'])
timeGroup_inside = d_frame_inside.groupby(['source', 'action_time', 'target']).count().reset_index()
#ret = timeGroup_inside.to_json(orient="records",force_ascii=False)
#print(ret)

timeGroup_inside.to_json("temporal_data_inside.json", orient="records")
#fo = open("temporal_data_inside.json", "w")
#json.dump(ret, fo)
#fo.close()

d_frame_outside1 = d_frame[d_frame['source_dep'] != d_frame['target_dep']]
d_frame_outside2 = d_frame_outside1.copy()
d_frame_outside1 = d_frame_outside1.drop(columns=['source_dep', 'target'])
d_frame_outside2 = d_frame_outside2.drop(columns=['target_dep', 'source'])
d_frame_outside1.rename(columns = {'target_dep': 'dep', 'source': 'owner'},  inplace=True)
d_frame_outside2.rename(columns = {'source_dep': 'dep', 'target': 'owner'},  inplace=True)
d_frame_outside = pd.concat([d_frame_outside1, d_frame_outside2])
timeGroup_outside = d_frame_outside.groupby(['owner', 'action_time', 'dep']).count().reset_index()
#ret2 = timeGroup_outside.to_json(orient="records",force_ascii=False)
#print(ret2)

timeGroup_outside.to_json("temporal_data_outside.json", orient="records")
#fo2 = open("temporal_data_outside.json", "w")
#json.dump(ret2, fo2)
#fo2.close()

#add interaction edges
'''for i in range(0, len(edges['actor_id'])):
    if owner_index_mapping.__contains__(edges['actor_id'][i]) and owner_index_mapping.__contains__(edges['post_owner_id'][i]):
        if G.edge(G.vertex(owner_index_mapping[edges['post_owner_id'][i]]), G.vertex(owner_index_mapping[edges['actor_id'][i]])):
            e = G.edge(G.vertex(owner_index_mapping[edges['post_owner_id'][i]]), G.vertex(owner_index_mapping[edges['actor_id'][i]]))
        else:
            #print(1)
            e = G.add_edge(G.vertex(owner_index_mapping[edges['post_owner_id'][i]]), G.vertex(owner_index_mapping[edges['actor_id'][i]]))

        if edges['edge_type'][i] == 'post_like' or edges['edge_type'][i] == 'uploaded_photos_likes' or edges['edge_type'][i] == 'tagged_photos_likes':
            if e_like[e]:
                e_like[e] = e_like[e] + 1
            else:
                e_like[e] = 1

        if edges['edge_type'][i] == 'post_comment' or edges['edge_type'][i] == 'post_tag' or edges['edge_type'][i] == 'uploaded_photos_comment' or edges['edge_type'][i] == 'tagged_photos_comments':
            if e_message[e]:
                e_message[e] = e_message[e] + 1
            else:
                e_message[e] = 1


        if edges['edge_type'][i] == 'post_comment' or edges['edge_type'][i] == 'uploaded_photos_comment' or edges['edge_type'][i] == 'tagged_photos_comments':
            post_actor = []
            post_actor.append(edges['post_id'][i])
            post_actor.append(edges['actor_id'][i])
            post_actor.append(edges['comment_pos'][i])
            post_actor.append(edges['comment_neg'][i])
            post_actor.append(edges['comment_like_count'][i])
            comment_actor_recording.append(post_actor)
            if not post_bucket.__contains__(edges['actor_id'][i]):
                post_bucket[edges['post_id'][i]] = 1

       if edges['edge_type'][i] == 'uploaded_photos_tags' or edges['edge_type'][i] == 'tagged_photos_tags':
            if e_companion[e]:
                e_companion[e] = e_companion[e] + 1
            else:
                e_companion[e] = 1

#for i, j in edges.iterrows():
    if not owner_index_mapping.__contains__(j.actor_id):
        v = G.add_vertex()
        owner_index_mapping[j.actor_id] = G.vertex_index[v]
    if not owner_index_mapping.__contains__(j.post_owner_id):
        v = G.add_vertex()
        owner_index_mapping[j.post_owner_id] = G.vertex_index[v]
    if owner_index_mapping.__contains__(j.post_owner_id) and owner_index_mapping.__contains__(j.actor_id):
        if G.edge(G.vertex(owner_index_mapping[j.post_owner_id]), G.vertex(owner_index_mapping[j.actor_id])):
            e = G.edge(G.vertex(owner_index_mapping[j.post_owner_id]), G.vertex(owner_index_mapping[j.actor_id]))
        else:
            print(1)
            e = G.add_edge(G.vertex(owner_index_mapping[j.post_owner_id]), G.vertex(owner_index_mapping[j.actor_id]))

        if j.edge_type == 'post_like' or j.edge_type == 'uploaded_photos_likes' or j.edge_type == 'tagged_photos_likes':
            if e_like[e]:
                e_like[e] = e_like[e] + 1
            else:
                e_like[e] = 1

        if j.edge_type == 'post_comment' or j.edge_type == 'post_tag' or j.edge_type == 'uploaded_photos_comment' or j.edge_type == 'tagged_photos_comments':
            if e_message[e]:
                e_message[e] = e_message[e] + 1
            else:
                e_message[e] = 1

    post_actor = []
            post_actor.append(j.post_id)
            post_actor.append(j.actor_id)
            post_actor.append(j.comment_pos)
            post_actor.append(j.comment_neg)
            post_actor.append(j.comment_like_count)
            comment_actor_recording.append(post_actor)
            if not post_bucket.__contains__(j.post_id):
                post_bucket[j.post_id] = 1

    if j.edge_type == 'uploaded_photos_tags' or j.edge_type == 'tagged_photos_tags':
            if e_companion[e]:
                e_companion[e] = e_companion[e] + 1
            else:
                e_companion[e] = 1

e_friend = G.new_edge_property("int")
#add friend edges
friends = pd.read_csv("friends.csv", sep=",")
for i, j in friends.iterrows():
    if not owner_index_mapping.__contains__(j.friends_id):
        v = G.add_vertex()
        owner_index_mapping[j.friends_id] = G.vertex_index[v]
    if not owner_index_mapping.__contains__(j.OwnerFbid):
        v = G.add_vertex()
        owner_index_mapping[j.OwnerFbid] = G.vertex_index[v]
    if owner_index_mapping.__contains__(j.friends_id) and owner_index_mapping.__contains__(j.OwnerFbid):
        if G.edge(G.vertex(owner_index_mapping[j.OwnerFbid]), G.vertex(owner_index_mapping[j.friends_id])):
            e = G.edge(G.vertex(owner_index_mapping[j.OwnerFbid]), G.vertex(owner_index_mapping[j.friends_id]))
        else:
            e = G.add_edge(G.vertex(owner_index_mapping[j.OwnerFbid]), G.vertex(owner_index_mapping[j.friends_id]))
        e_friend[e] = 1'''

#merge property
G.vertex_properties["school"] = v_school
G.vertex_properties["department"] = v_department
G.vertex_properties["rclass"] = v_rclass
G.vertex_properties["gender"] = v_gender
G.vertex_properties["tracking"] = v_tracking
G.vertex_properties["major1"] = v_major1
G.vertex_properties["discipline"] = v_discipline
G.vertex_properties["grade"] = v_grade
G.vertex_properties["liveplace"] = v_liveplace
G.edge_properties["companion"] = e_companion
G.edge_properties["message"] = e_message
G.edge_properties["like"] = e_like
G.edge_properties["weight"] = e_weight
G.edge_properties["friend"] = e_friend

#save mappings
'''np.save('owner_index_mapping.npy', owner_index_mapping)
np.save('post_bucket.npy', post_bucket)
np.save('comment_actor_recording.npy', comment_actor_recording)'''

#save network
G.save("new_new_network.xml.gz")

#construct comment actor matrix
'''len_actor = G.num_vertices()
len_post = len(post_bucket)
actor_comment_times_for_post = np.zeros((len_actor, len_post))
actor_comment_pos_for_post = np.zeros((len_actor, len_post))
actor_comment_neg_for_post = np.zeros((len_actor, len_post))
actor_comment_likes_for_post = np.zeros((len_actor, len_post))
for i in range(len(comment_actor_recording)):
    actor_comment_times_for_post[comment_actor_recording[i][1], comment_actor_recording[i][0]] += 1
    actor_comment_pos_for_post[comment_actor_recording[i][1], comment_actor_recording[i][0]] += comment_actor_recording[i][2]
    actor_comment_neg_for_post[comment_actor_recording[i][1], comment_actor_recording[i][0]] += comment_actor_recording[i][3]
    actor_comment_likes_for_post[comment_actor_recording[i][1], comment_actor_recording[i][0]] += comment_actor_recording[i][4]'''

#save matrix
'''np.save('actor_comment_times_for_post.npy', actor_comment_times_for_post)
np.save('actor_comment_pos_for_post.npy', actor_comment_pos_for_post)
np.save('actor_comment_neg_for_post.npy', actor_comment_neg_for_post)
np.save('actor_comment_likes_for_post.npy', actor_comment_likes_for_post)'''

